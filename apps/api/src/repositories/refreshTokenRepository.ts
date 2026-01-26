/**
 * Refresh Token Repository
 *
 * STRICT: Data access for refresh tokens only.
 */

import type { PrismaClient, RefreshToken, Prisma } from '@prisma/client';

export interface IRefreshTokenRepository {
    create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken>;
    findByToken(token: string): Promise<RefreshToken | null>;
    revokeByToken(token: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
    deleteExpired(): Promise<number>;
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
    constructor(private prisma: PrismaClient) { }

    async create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
        return this.prisma.refreshToken.create({ data });
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
    }

    async revokeByToken(token: string): Promise<void> {
        await this.prisma.refreshToken.update({
            where: { token },
            data: { revokedAt: new Date() },
        });
    }

    async revokeAllForUser(userId: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    async deleteExpired(): Promise<number> {
        const result = await this.prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { revokedAt: { not: null } },
                ],
            },
        });
        return result.count;
    }
}
