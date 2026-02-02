/**
 * Auth Service
 *
 * STRICT: All authentication business logic lives here.
 * - Receives dependencies via constructor (DIP)
 * - Throws custom errors (not HTTP errors)
 * - Framework-agnostic (no req/res)
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { User } from '@prisma/client';
import { ROLES, SUBSCRIPTION_STATUS, type Role } from '@unimobiliare/shared';
import { AUTH_CONFIG } from '../config/auth';
import { getEnv } from '../config/env';
import type { IUserRepository } from '../repositories/userRepository';
import type { IRefreshTokenRepository } from '../repositories/refreshTokenRepository';
import {
    UnauthorizedError,
    ConflictError,
    NotFoundError,
    BadRequestError,
} from '../errors';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResult {
    user: SafeUser;
    tokens: TokenPair;
}

export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}

// User without sensitive fields
type SafeUser = Omit<User, 'passwordHash'>;

// ─────────────────────────────────────────────────────────────────────────────
// Service Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IAuthService {
    register(input: RegisterInput): Promise<AuthResult>;
    login(input: LoginInput): Promise<AuthResult>;
    refresh(refreshToken: string): Promise<TokenPair>;
    logout(refreshToken: string): Promise<void>;
    logoutAllDevices(userId: string): Promise<void>;
    getUserById(userId: string): Promise<SafeUser>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class AuthService implements IAuthService {
    constructor(
        private userRepository: IUserRepository,
        private refreshTokenRepository: IRefreshTokenRepository
    ) { }

    /**
     * Register new user
     */
    async register(input: RegisterInput): Promise<AuthResult> {
        const { email, password, name } = input;

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, AUTH_CONFIG.PASSWORD_SALT_ROUNDS);

        // Calculate trial end date
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + AUTH_CONFIG.DEFAULT_TRIAL_DAYS);

        // Create user
        const user = await this.userRepository.create({
            email: email.toLowerCase().trim(),
            passwordHash,
            name: name.trim(),
            role: ROLES.USER,
            subscriptionStatus: SUBSCRIPTION_STATUS.TRIAL,
            trialEndsAt,
            emailVerified: false,
        });

        // Generate tokens
        const tokens = await this.generateTokenPair(user);

        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }

    /**
     * Login user
     */
    async login(input: LoginInput): Promise<AuthResult> {
        const { email, password } = input;

        // Find user
        const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Check if user is deleted
        if (user.deletedAt) {
            throw new UnauthorizedError('Account has been deactivated');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const tokens = await this.generateTokenPair(user);

        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refresh(refreshToken: string): Promise<TokenPair> {
        // Find refresh token
        const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);

        if (!storedToken) {
            throw new UnauthorizedError('Invalid refresh token');
        }

        // Check if token is revoked
        if (storedToken.revokedAt) {
            throw new UnauthorizedError('Refresh token has been revoked');
        }

        // Check if token is expired
        if (storedToken.expiresAt < new Date()) {
            throw new UnauthorizedError('Refresh token has expired');
        }

        // Get user
        const user = await this.userRepository.findById(storedToken.userId);
        if (!user || user.deletedAt) {
            throw new UnauthorizedError('User not found or deactivated');
        }

        // Revoke old token (rotation)
        await this.refreshTokenRepository.revokeByToken(refreshToken);

        // Generate new token pair
        return this.generateTokenPair(user);
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(refreshToken: string): Promise<void> {
        try {
            await this.refreshTokenRepository.revokeByToken(refreshToken);
        } catch {
            // Token might not exist, that's okay
        }
    }

    /**
     * Logout from all devices - revoke all refresh tokens
     */
    async logoutAllDevices(userId: string): Promise<void> {
        await this.refreshTokenRepository.revokeAllForUser(userId);
    }

    /**
     * Get user by ID (for /me endpoint)
     */
    async getUserById(userId: string): Promise<SafeUser> {
        const user = await this.userRepository.findById(userId);
        if (!user || user.deletedAt) {
            throw new NotFoundError('User not found');
        }
        return this.sanitizeUser(user);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Generate JWT access and refresh token pair
     */
    private async generateTokenPair(user: User): Promise<TokenPair> {
        const env = getEnv();

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role as Role,
        };

        // Generate access token
        const accessToken = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_ACCESS_EXPIRY || AUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
        });

        // Generate refresh token (random string stored in DB)
        const refreshTokenValue = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_MS);

        // Store refresh token
        await this.refreshTokenRepository.create({
            token: refreshTokenValue,
            expiresAt,
            user: { connect: { id: user.id } },
        });

        return {
            accessToken,
            refreshToken: refreshTokenValue,
        };
    }

    /**
     * Remove sensitive fields from user object
     */
    private sanitizeUser(user: User): SafeUser {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
}
