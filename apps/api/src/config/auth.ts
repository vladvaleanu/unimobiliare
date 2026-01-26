/**
 * Auth Configuration Constants
 *
 * STRICT: No magic numbers - all auth-related values centralized here.
 */

export const AUTH_CONFIG = {
    // Password
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_SALT_ROUNDS: 12,

    // JWT
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

    // Trial
    DEFAULT_TRIAL_DAYS: 14,

    // Rate limiting
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_MINUTES: 15,
} as const;
