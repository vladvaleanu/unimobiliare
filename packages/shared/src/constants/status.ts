/**
 * Subscription status values
 * @description User subscription lifecycle states
 */
export const SUBSCRIPTION_STATUS = {
    TRIAL: 'trial',
    ACTIVE: 'active',
    PAST_DUE: 'past_due',
    CANCELED: 'canceled',
    EXPIRED: 'expired',
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

/**
 * Integration sync status
 * @description Status of platform integration sync jobs
 */
export const SYNC_STATUS = {
    IDLE: 'idle',
    RUNNING: 'running',
    SUCCESS: 'success',
    FAILED: 'failed',
    PARTIAL: 'partial',
} as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

/**
 * Listing status
 * @description Property listing lifecycle states
 */
export const LISTING_STATUS = {
    ACTIVE: 'active',
    SOLD: 'sold',
    RENTED: 'rented',
    EXPIRED: 'expired',
    DUPLICATE: 'duplicate',
    FLAGGED: 'flagged',
} as const;

export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

/**
 * Audit log actions
 * @description Types of actions logged in audit trail
 */
export const AUDIT_ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'login',
    LOGOUT: 'logout',
    VIEW: 'view',
    EXPORT: 'export',
    IMPERSONATE: 'impersonate',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/**
 * Property transaction types
 */
export const TRANSACTION_TYPES = {
    SALE: 'sale',
    RENT: 'rent',
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

/**
 * Property types
 */
export const PROPERTY_TYPES = {
    APARTMENT: 'apartment',
    HOUSE: 'house',
    STUDIO: 'studio',
    LAND: 'land',
    COMMERCIAL: 'commercial',
    OFFICE: 'office',
} as const;

export type PropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES];
