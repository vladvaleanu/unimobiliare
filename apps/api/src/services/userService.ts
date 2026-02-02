/**
 * User Service
 * 
 * STRICT: Business logic for user management (admin)
 */

import type { User } from '@prisma/client';
import type { IUserRepository } from '../repositories/userRepository';
import { NotFoundError } from '../errors';

// User without sensitive fields
type SafeUser = Omit<User, 'passwordHash'>;

export interface UserListOptions {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    subscriptionStatus?: string;
}

export interface UserListResponse {
    users: SafeUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface IUserService {
    getUsers(options: UserListOptions): Promise<UserListResponse>;
    getUserById(id: string): Promise<SafeUser>;
    updateUser(id: string, data: Partial<Pick<User, 'name' | 'role' | 'subscriptionStatus'>>): Promise<SafeUser>;
    deleteUser(id: string): Promise<void>;
}

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) { }

    async getUsers(options: UserListOptions): Promise<UserListResponse> {
        const { page, limit, search, role, subscriptionStatus } = options;
        const skip = (page - 1) * limit;

        const { users, total } = await this.userRepository.findMany({
            skip,
            take: limit,
            search,
            role,
            subscriptionStatus,
        });

        return {
            users: users.map(this.sanitizeUser),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUserById(id: string): Promise<SafeUser> {
        const user = await this.userRepository.findById(id);
        if (!user || user.deletedAt) {
            throw new NotFoundError('User not found');
        }
        return this.sanitizeUser(user);
    }

    async updateUser(id: string, data: Partial<Pick<User, 'name' | 'role' | 'subscriptionStatus'>>): Promise<SafeUser> {
        const user = await this.userRepository.findById(id);
        if (!user || user.deletedAt) {
            throw new NotFoundError('User not found');
        }

        const updated = await this.userRepository.update(id, data);
        return this.sanitizeUser(updated);
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user || user.deletedAt) {
            throw new NotFoundError('User not found');
        }

        await this.userRepository.softDelete(id);
    }

    private sanitizeUser(user: User): SafeUser {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
}
