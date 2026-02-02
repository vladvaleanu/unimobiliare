/**
 * Listing Controller
 * 
 * STRICT: Controllers only orchestrate - NO business logic
 */

import type { Request, Response, NextFunction } from 'express';
import type { IListingService } from '../services/listingService';

export class ListingController {
    constructor(private listingService: IListingService) { }

    /**
     * GET /api/v1/listings
     */
    getListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);
            const city = req.query.city as string | undefined;
            const transactionType = req.query.transactionType as string | undefined;
            const propertyType = req.query.propertyType as string | undefined;
            const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
            const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
            const rooms = req.query.rooms ? parseInt(req.query.rooms as string) : undefined;

            const result = await this.listingService.getListings({
                page,
                limit,
                city,
                transactionType,
                propertyType,
                minPrice,
                maxPrice,
                rooms,
            });

            res.json({
                success: true,
                data: {
                    listings: result.listings,
                    total: result.pagination.total,
                    page: result.pagination.page,
                    totalPages: result.pagination.totalPages,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/listings/:id
     */
    getListingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const listing = await this.listingService.getListingById(id);

            if (!listing) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Listing not found' },
                });
                return;
            }

            res.json({
                success: true,
                data: listing,
            });
        } catch (error) {
            next(error);
        }
    };
}
