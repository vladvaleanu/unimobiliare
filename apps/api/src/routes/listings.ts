/**
 * Listing Routes
 * 
 * STRICT: Routes only wire endpoints to controllers
 */

import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { ListingController } from '../controllers/listingController';
import { ListingService } from '../services/listingService';
import { ListingRepository } from '../repositories/listingRepository';
import { SavedListingRepository } from '../repositories/savedListingRepository';

const router = Router();

// Create instances (simple DI for now)
const listingRepository = new ListingRepository();
const listingService = new ListingService(listingRepository);
const listingController = new ListingController(listingService);
const savedListingRepository = new SavedListingRepository();

/**
 * GET /api/v1/listings
 * Get paginated listings with filters
 */
router.get('/', listingController.getListings);

/**
 * GET /api/v1/listings/saved
 * Get user's saved listings (auth required)
 */
router.get('/saved', authenticate, async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);

        const { listings, total } = await savedListingRepository.findByUser(userId, page, limit);

        res.json({
            success: true,
            data: {
                listings,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/listings/:id
 * Get a single listing by ID
 */
router.get('/:id', listingController.getListingById);

/**
 * POST /api/v1/listings/:id/save
 * Save a listing (auth required)
 */
router.post('/:id/save', authenticate, async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;
        const listingId = req.params.id;

        await savedListingRepository.save(userId, listingId);

        res.json({
            success: true,
            data: { message: 'Listing saved' },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/listings/:id/save
 * Unsave a listing (auth required)
 */
router.delete('/:id/save', authenticate, async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;
        const listingId = req.params.id;

        await savedListingRepository.unsave(userId, listingId);

        res.json({
            success: true,
            data: { message: 'Listing unsaved' },
        });
    } catch (error) {
        next(error);
    }
});

export { router as listingRoutes };
