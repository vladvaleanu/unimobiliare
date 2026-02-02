/**
 * User Repository
 *
 * STRICT: Singura interfață cu baza de date pentru Users.
 * Business logic NU aparține aici - doar data access.
 */

import type { PrismaClient, User, Prisma } from '@prisma/client';
import { PAGINATION } from '@unimobiliare/shared';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;
    findMany(options?: FindUsersOptions): Promise<{ users: User[]; total: number }>;
}

export interface FindUsersOptions {
    page?: number;
    limit?: number;
    skip?: number;
    take?: number;
    role?: string;
    subscriptionStatus?: string;
    search?: string;
}

export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: { plan: true },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: { plan: true },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
            include: { plan: true },
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
            include: { plan: true },
        });
    }

    async delete(id: string): Promise<void> {
        // Soft delete - set deletedAt timestamp
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async softDelete(id: string): Promise<void> {
        return this.delete(id);
    }

    async findMany(options: FindUsersOptions = {}): Promise<{ users: User[]; total: number }> {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            role,
            search,
        } = options;

        const where: Prisma.UserWhereInput = {
            deletedAt: null, // Only non-deleted users
        };

        if (role) {
            where.role = role as any;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: { plan: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { users, total };
    }
}
