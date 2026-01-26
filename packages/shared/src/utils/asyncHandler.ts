/**
 * Async handler wrapper for Express route handlers
 * Catches errors and passes them to next() for centralized error handling
 */
export const asyncHandler = <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T
): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
        const next = args[2] as (error?: unknown) => void;
        Promise.resolve(fn(...args)).catch(next);
    };
};
