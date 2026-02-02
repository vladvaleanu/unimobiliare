/**
 * Listing Service
 * 
 * STRICT: Business logic for listings
 */

import type { Listing } from '@prisma/client';
import type { IListingRepository } from '../repositories/listingRepository';

// Frontend expected format
export interface ListingForFrontend {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    propertyType: string;
    transactionType: string;
    location: {
        city: string;
        neighborhood?: string;
        address?: string;
    };
    details: {
        rooms?: number;
        bathrooms?: number;
        area?: number;
        floor?: number;
        totalFloors?: number;
        yearBuilt?: number;
    };
    images: string[];
    sourceUrl: string;
    sourcePlatform: string;
    publishedAt: string;
    isSaved?: boolean;
    priceFormatted?: string;
}

export interface ListingsResponse {
    listings: ListingForFrontend[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface IListingService {
    getListings(options: {
        page: number;
        limit: number;
        city?: string;
        transactionType?: string;
        propertyType?: string;
        minPrice?: number;
        maxPrice?: number;
        rooms?: number;
    }): Promise<ListingsResponse>;
    getListingById(id: string): Promise<ListingForFrontend | null>;
}

export class ListingService implements IListingService {
    constructor(private listingRepository: IListingRepository) { }

    async getListings(options: {
        page: number;
        limit: number;
        city?: string;
        transactionType?: string;
        propertyType?: string;
        minPrice?: number;
        maxPrice?: number;
        rooms?: number;
    }): Promise<ListingsResponse> {
        const { listings, total } = await this.listingRepository.findMany(options);

        return {
            listings: listings.map(listing => this.transformToFrontend(listing)),
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                totalPages: Math.ceil(total / options.limit),
            },
        };
    }

    async getListingById(id: string): Promise<ListingForFrontend | null> {
        const listing = await this.listingRepository.findById(id);
        return listing ? this.transformToFrontend(listing) : null;
    }

    private transformToFrontend(listing: Listing & { integration?: any }): ListingForFrontend {
        const numPrice = typeof listing.price === 'object' ? parseFloat(listing.price.toString()) : Number(listing.price);
        const areaSqm = listing.areaSqm ? (typeof listing.areaSqm === 'object' ? parseFloat(listing.areaSqm.toString()) : Number(listing.areaSqm)) : undefined;

        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: numPrice,
            currency: listing.currency,
            propertyType: listing.propertyType,
            transactionType: listing.transactionType,
            location: {
                city: listing.city,
                neighborhood: listing.neighborhood ?? undefined,
                address: listing.street ?? undefined,
            },
            details: {
                rooms: listing.rooms ?? undefined,
                area: areaSqm,
                floor: listing.floor ?? undefined,
                totalFloors: listing.totalFloors ?? undefined,
                yearBuilt: listing.yearBuilt ?? undefined,
            },
            images: listing.images || [],
            sourceUrl: listing.sourceUrl,
            sourcePlatform: listing.integration?.displayName || listing.integration?.name || 'Unknown',
            publishedAt: listing.firstSeenAt?.toISOString() || listing.createdAt.toISOString(),
            priceFormatted: this.formatPrice(numPrice, listing.currency),
        };
    }

    private formatPrice(price: number, currency: string): string {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency || 'RON',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    }
}

