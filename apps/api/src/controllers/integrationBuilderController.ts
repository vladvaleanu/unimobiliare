/**
 * Integration Builder Controller
 * 
 * STRICT: Controllers only orchestrate - NO business logic
 * Handles No-Code Integration Builder endpoints for testing and previewing scrapers.
 */

import type { Request, Response, NextFunction } from 'express';
import { ScrapingService, type FieldMapping } from '../services/scrapingService';

const scrapingService = new ScrapingService();

/**
 * POST /api/v1/integrations/test-selector
 * Test a CSS selector on a URL or HTML content
 */
export async function testSelector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { url, html, selector } = req.body;

        if (!selector) {
            res.status(400).json({
                success: false,
                error: { message: 'Selector is required' },
            });
            return;
        }

        let pageHtml = html;

        // Fetch page if URL provided and no HTML
        if (!pageHtml && url) {
            const { html: fetchedHtml } = await scrapingService.fetchPage(url);
            pageHtml = fetchedHtml;
        }

        if (!pageHtml) {
            res.status(400).json({
                success: false,
                error: { message: 'Either url or html is required' },
            });
            return;
        }

        const result = scrapingService.testSelector(pageHtml, selector);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/integrations/preview
 * Preview field extractions on a URL
 */
export async function previewExtraction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { url, fieldMappings } = req.body as { url: string; fieldMappings: FieldMapping[] };

        if (!url) {
            res.status(400).json({
                success: false,
                error: { message: 'URL is required' },
            });
            return;
        }

        if (!fieldMappings || !Array.isArray(fieldMappings)) {
            res.status(400).json({
                success: false,
                error: { message: 'fieldMappings array is required' },
            });
            return;
        }

        const result = await scrapingService.previewExtraction(url, fieldMappings);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/integrations/fetch-page
 * Fetch a page and return HTML for client-side testing
 */
export async function fetchPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({
                success: false,
                error: { message: 'URL is required' },
            });
            return;
        }

        const { html, status } = await scrapingService.fetchPage(url);

        res.json({
            success: true,
            data: {
                html,
                status,
                length: html.length,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/integrations/batch-test
 * Test extraction on multiple URLs
 */
export async function batchTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { urls, fieldMappings } = req.body as { urls: string[]; fieldMappings: FieldMapping[] };

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            res.status(400).json({
                success: false,
                error: { message: 'urls array is required' },
            });
            return;
        }

        if (!fieldMappings || !Array.isArray(fieldMappings)) {
            res.status(400).json({
                success: false,
                error: { message: 'fieldMappings array is required' },
            });
            return;
        }

        // Limit to 10 URLs
        const limitedUrls = urls.slice(0, 10);

        const results = await Promise.allSettled(
            limitedUrls.map(url => scrapingService.previewExtraction(url, fieldMappings))
        );

        const data = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            return {
                url: limitedUrls[index],
                title: '',
                success: false,
                extractions: [],
                error: result.reason?.message || 'Unknown error',
            };
        });

        res.json({
            success: true,
            data: {
                tested: limitedUrls.length,
                results: data,
            },
        });
    } catch (error) {
        next(error);
    }
}
