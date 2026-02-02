/**
 * Listing Repository
 * 
 * STRICT: Repository only handles data access - no business logic
 */

import { getPrismaClient } from '@unimobiliare/database';
import type { Listing, Prisma } from '@prisma/client';

export interface IListingRepository {
    findMany(options: {
        page: number;
        limit: number;
        city?: string;
        transactionType?: string;
        propertyType?: string;
        minPrice?: number;
        maxPrice?: number;
        rooms?: number;
    }): Promise<{ listings: Listing[]; total: number }>;
    findById(id: string): Promise<Listing | null>;
}

export class ListingRepository implements IListingRepository {
    private get prisma() {
        return getPrismaClient();
    }

    async findMany(options: {
        page: number;
        limit: number;
        city?: string;
        transactionType?: string;
        propertyType?: string;
        minPrice?: number;
        maxPrice?: number;
        rooms?: number;
    }): Promise<{ listings: Listing[]; total: number }> {
        const { page, limit, city, transactionType, propertyType, minPrice, maxPrice, rooms } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ListingWhereInput = {
            status: 'active',
        };

        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }

        if (transactionType) {
            where.transactionType = transactionType as any;
        }

        if (propertyType) {
            where.propertyType = propertyType as any;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }

        if (rooms !== undefined) {
            where.rooms = rooms;
        }

        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { integration: true },
            }),
            this.prisma.listing.count({ where }),
        ]);

        return { listings, total };
    }

    async findById(id: string): Promise<Listing | null> {
        return this.prisma.listing.findUnique({
            where: { id },
            include: {
                integration: true,
                priceHistory: {
                    orderBy: { recordedAt: 'desc' },
                    take: 10,
                },
            },
        });
    }
}
