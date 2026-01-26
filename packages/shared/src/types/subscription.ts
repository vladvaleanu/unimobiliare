/**
 * Subscription plan limits
 */
export interface PlanLimits {
    maxSearchProfiles: number;
    maxSavedListings: number;
    maxAlerts: number;
}

/**
 * Subscription plan features
 */
export interface PlanFeatures {
    aiFeatures: boolean;
    priceHistory: boolean;
    exportData: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
}

/**
 * Alert types available in plans
 */
export type AlertType = 'email_instant' | 'email_daily' | 'email_weekly' | 'push';

/**
 * Subscription plan entity
 */
export interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceMonthly: number;
    priceYearly: number;
    currency: 'RON';
    trialDays: number;
    limits: PlanLimits;
    features: PlanFeatures;
    alertTypes: AlertType[];
    isActive: boolean;
    isFeatured: boolean;
    displayOrder: number;
    stripePriceIds: {
        monthly: string | null;
        yearly: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Plan creation/update input
 */
export interface SubscriptionPlanInput {
    name: string;
    slug?: string;
    description?: string | null;
    priceMonthly: number;
    priceYearly: number;
    trialDays?: number;
    limits: PlanLimits;
    features: PlanFeatures;
    alertTypes: AlertType[];
    isActive?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
    stripePriceIds?: {
        monthly: string | null;
        yearly: string | null;
    };
}
