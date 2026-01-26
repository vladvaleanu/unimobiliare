import type { ListingStatus, TransactionType, PropertyType } from '../constants/status.js';

/**
 * Location data for a listing
 */
export interface ListingLocation {
    city: string;
    neighborhood: string | null;
    street: string | null;
    latitude: number | null;
    longitude: number | null;
}

/**
 * Property listing entity
 */
export interface Listing {
    id: string;
    externalId: string;
    integrationId: string;
    title: string;
    description: string | null;
    price: number;
    currency: 'RON' | 'EUR';
    transactionType: TransactionType;
    propertyType: PropertyType;
    areaSqm: number | null;
    rooms: number | null;
    floor: number | null;
    totalFloors: number | null;
    yearBuilt: number | null;
    location: ListingLocation;
    images: string[];
    sourceUrl: string;
    status: ListingStatus;
    firstSeenAt: Date;
    lastSeenAt: Date;
    priceHistory: PriceHistoryEntry[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Price history entry
 */
export interface PriceHistoryEntry {
    price: number;
    currency: 'RON' | 'EUR';
    recordedAt: Date;
}

/**
 * Listing search filters
 */
export interface ListingFilters {
    transactionType?: TransactionType;
    propertyType?: PropertyType;
    city?: string;
    neighborhood?: string;
    priceMin?: number;
    priceMax?: number;
    areaSqmMin?: number;
    areaSqmMax?: number;
    roomsMin?: number;
    roomsMax?: number;
}

/**
 * Listing without full details (for list views)
 */
export type ListingSummary = Pick<
    Listing,
    | 'id'
    | 'title'
    | 'price'
    | 'currency'
    | 'transactionType'
    | 'propertyType'
    | 'areaSqm'
    | 'rooms'
    | 'location'
    | 'images'
    | 'status'
>;
