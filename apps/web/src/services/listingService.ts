import { apiClient } from './apiClient';

interface Listing {
    id: string;
    title: string;
    description: string;
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
}

interface SearchFilters {
    propertyType?: string;
    transactionType?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    rooms?: number;
    areaMin?: number;
    areaMax?: number;
    page?: number;
    limit?: number;
}

interface SearchResponse {
    listings: Listing[];
    total: number;
    page: number;
    totalPages: number;
}

export const listingService = {
    async searchListings(filters: SearchFilters) {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        return apiClient.get<SearchResponse>(`/api/v1/listings?${params.toString()}`);
    },

    async getListingById(id: string) {
        return apiClient.get<Listing>(`/api/v1/listings/${id}`);
    },

    async saveListing(listingId: string) {
        return apiClient.post(`/api/v1/listings/${listingId}/save`);
    },

    async unsaveListing(listingId: string) {
        return apiClient.delete(`/api/v1/listings/${listingId}/save`);
    },

    async getSavedListings(page = 1, limit = 20) {
        return apiClient.get<SearchResponse>(`/api/v1/listings/saved?page=${page}&limit=${limit}`);
    },
};

export type { Listing, SearchFilters, SearchResponse };
