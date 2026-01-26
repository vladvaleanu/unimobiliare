/**
 * Pagination constants
 * @description Default and max values for list queries
 */
export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
} as const;

/**
 * Time constants in milliseconds
 * @description Use these instead of raw numbers for timeouts/intervals
 */
export const TIME = {
    ONE_SECOND_MS: 1000,
    ONE_MINUTE_MS: 60 * 1000,
    FIVE_MINUTES_MS: 5 * 60 * 1000,
    FIFTEEN_MINUTES_MS: 15 * 60 * 1000,
    ONE_HOUR_MS: 60 * 60 * 1000,
    ONE_DAY_MS: 24 * 60 * 60 * 1000,
    ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * JWT token expiry times
 */
export const TOKEN_EXPIRY = {
    ACCESS_TOKEN: '15m',
    REFRESH_TOKEN: '7d',
    PASSWORD_RESET: '1h',
    EMAIL_VERIFICATION: '24h',
} as const;

/**
 * Rate limiting defaults
 */
export const RATE_LIMITS = {
    API_REQUESTS_PER_MINUTE: 60,
    LOGIN_ATTEMPTS_PER_HOUR: 5,
    SCRAPING_REQUESTS_PER_MINUTE: 10,
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
    MAX_IMAGE_SIZE_MB: 5,
    MAX_DOCUMENT_SIZE_MB: 10,
    MAX_IMAGES_PER_LISTING: 20,
} as const;

/**
 * Password requirements
 */
export const PASSWORD = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    BCRYPT_ROUNDS: 12,
} as const;
