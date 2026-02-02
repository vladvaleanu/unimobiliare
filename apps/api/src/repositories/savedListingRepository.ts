/**
 * Saved Listing Repository
 * 
 * STRICT: Repository for saved listings
 */

import { getPrismaClient } from '@unimobiliare/database';
import type { SavedListing, Listing, Prisma } from '@prisma/client';

export interface ISavedListingRepository {
    save(userId: string, listingId: string): Promise<SavedListing>;
    unsave(userId: string, listingId: string): Promise<void>;
    findByUser(userId: string, page: number, limit: number): Promise<{ listings: Listing[]; total: number }>;
    isSaved(userId: string, listingId: string): Promise<boolean>;
}

export class SavedListingRepository implements ISavedListingRepository {
    private get prisma() {
        return getPrismaClient();
    }

    async save(userId: string, listingId: string): Promise<SavedListing> {
        return this.prisma.savedListing.upsert({
            where: {
                userId_listingId: { userId, listingId },
            },
            create: { userId, listingId },
            update: {},
        });
    }

    async unsave(userId: string, listingId: string): Promise<void> {
        await this.prisma.savedListing.deleteMany({
            where: { userId, listingId },
        });
    }

    async findByUser(userId: string, page: number, limit: number): Promise<{ listings: Listing[]; total: number }> {
        const skip = (page - 1) * limit;

        const [savedListings, total] = await Promise.all([
            this.prisma.savedListing.findMany({
                where: { userId },
                include: { listing: true },
                skip,
                take: limit,
                orderBy: { savedAt: 'desc' },
            }),
            this.prisma.savedListing.count({ where: { userId } }),
        ]);

        return {
            listings: savedListings.map((sl) => sl.listing),
            total,
        };
    }

    async isSaved(userId: string, listingId: string): Promise<boolean> {
        const saved = await this.prisma.savedListing.findFirst({
            where: { userId, listingId },
        });
        return !!saved;
    }
}
