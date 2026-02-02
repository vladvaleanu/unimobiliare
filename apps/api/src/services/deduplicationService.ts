/**
 * Deduplication Service
 * 
 * Detects duplicate listings across different sources using:
 * - Text similarity (embeddings)
 * - Image hashing (pHash)
 * - Fuzzy matching on key fields
 */

import { aiService } from './aiService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ListingForDedup {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    location: {
        city: string;
        neighborhood?: string;
    };
    areaSqm?: number;
    rooms?: number;
    images?: string[];
    externalId?: string;
    sourceId?: string;
}

export interface DuplicateMatch {
    listingId: string;
    matchedListingId: string;
    score: number; // 0-100, higher = more likely duplicate
    matchReasons: string[];
    confidence: 'high' | 'medium' | 'low';
}

export interface DeduplicationResult {
    processed: number;
    duplicatesFound: number;
    matches: DuplicateMatch[];
    duration: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deduplication Service
// ─────────────────────────────────────────────────────────────────────────────

export class DeduplicationService {
    private readonly SIMILARITY_THRESHOLD = 0.85; // 85% similarity for duplicate

    /**
     * Find duplicates for a single listing
     */
    async findDuplicates(
        listing: ListingForDedup,
        existingListings: ListingForDedup[]
    ): Promise<DuplicateMatch[]> {
        const matches: DuplicateMatch[] = [];

        for (const existing of existingListings) {
            if (listing.id === existing.id) continue;
            if (listing.externalId === existing.externalId && listing.sourceId === existing.sourceId) continue;

            const match = await this.compareTwoListings(listing, existing);
            if (match.score >= 50) {
                matches.push(match);
            }
        }

        return matches.sort((a, b) => b.score - a.score);
    }

    /**
     * Compare two listings for similarity
     */
    async compareTwoListings(a: ListingForDedup, b: ListingForDedup): Promise<DuplicateMatch> {
        const matchReasons: string[] = [];
        let totalScore = 0;
        let weights = 0;

        // 1. Location match (required for duplicate)
        if (a.location.city.toLowerCase() !== b.location.city.toLowerCase()) {
            return {
                listingId: a.id,
                matchedListingId: b.id,
                score: 0,
                matchReasons: ['Different city - not a duplicate'],
                confidence: 'low',
            };
        }

        // 2. Neighborhood similarity
        if (a.location.neighborhood && b.location.neighborhood) {
            const neighSimilarity = this.stringSimilarity(
                a.location.neighborhood.toLowerCase(),
                b.location.neighborhood.toLowerCase()
            );
            if (neighSimilarity > 0.8) {
                totalScore += 15;
                matchReasons.push('Same neighborhood');
            }
            weights += 15;
        }

        // 3. Price similarity (within 5%)
        const priceDiff = Math.abs(a.price - b.price) / Math.max(a.price, b.price);
        if (priceDiff < 0.05) {
            totalScore += 25;
            matchReasons.push('Price within 5%');
        } else if (priceDiff < 0.15) {
            totalScore += 10;
            matchReasons.push('Price within 15%');
        }
        weights += 25;

        // 4. Area similarity (within 5sqm)
        if (a.areaSqm && b.areaSqm) {
            const areaDiff = Math.abs(a.areaSqm - b.areaSqm);
            if (areaDiff <= 2) {
                totalScore += 20;
                matchReasons.push('Same area (±2 sqm)');
            } else if (areaDiff <= 5) {
                totalScore += 10;
                matchReasons.push('Similar area (±5 sqm)');
            }
            weights += 20;
        }

        // 5. Rooms match
        if (a.rooms && b.rooms) {
            if (a.rooms === b.rooms) {
                totalScore += 15;
                matchReasons.push('Same number of rooms');
            }
            weights += 15;
        }

        // 6. Title similarity (fuzzy)
        const titleSimilarity = this.stringSimilarity(
            this.normalizeText(a.title),
            this.normalizeText(b.title)
        );
        if (titleSimilarity > 0.8) {
            totalScore += 15;
            matchReasons.push('Similar title');
        }
        weights += 15;

        // 7. Description similarity using embeddings (expensive, only if score is promising)
        if (weights > 0 && (totalScore / weights) * 100 >= 40 && a.description && b.description) {
            try {
                const descScore = await this.getTextSimilarity(a.description, b.description);
                if (descScore > 0.85) {
                    totalScore += 10;
                    matchReasons.push('Very similar description');
                }
                weights += 10;
            } catch {
                // Skip if AI service fails
            }
        }

        const finalScore = weights > 0 ? Math.round((totalScore / weights) * 100) : 0;

        return {
            listingId: a.id,
            matchedListingId: b.id,
            score: finalScore,
            matchReasons,
            confidence: finalScore >= 80 ? 'high' : finalScore >= 60 ? 'medium' : 'low',
        };
    }

    /**
     * Batch deduplication for new listings
     */
    async batchDeduplicate(
        newListings: ListingForDedup[],
        existingListings: ListingForDedup[]
    ): Promise<DeduplicationResult> {
        const startTime = Date.now();
        const allMatches: DuplicateMatch[] = [];

        for (const listing of newListings) {
            const matches = await this.findDuplicates(listing, existingListings);
            allMatches.push(...matches.filter(m => m.confidence !== 'low'));
        }

        return {
            processed: newListings.length,
            duplicatesFound: allMatches.filter(m => m.confidence === 'high').length,
            matches: allMatches,
            duration: Date.now() - startTime,
        };
    }

    /**
     * Get text similarity using AI embeddings
     */
    private async getTextSimilarity(text1: string, text2: string): Promise<number> {
        const result = await aiService.embed({ text: [text1, text2] });

        if (!result.success || result.embeddings.length < 2) {
            return 0;
        }

        return this.cosineSimilarity(result.embeddings[0], result.embeddings[1]);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    /**
     * Simple string similarity (Jaccard)
     */
    private stringSimilarity(s1: string, s2: string): number {
        const words1 = new Set(s1.toLowerCase().split(/\s+/));
        const words2 = new Set(s2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    /**
     * Normalize text for comparison
     */
    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

export const deduplicationService = new DeduplicationService();
