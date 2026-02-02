import { apiClient } from './apiClient';

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    maxAlerts: number;
    maxSavedListings: number;
    isPopular?: boolean;
}

interface Subscription {
    id: string;
    planId: string;
    plan: Plan;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;
}

interface CheckoutSession {
    sessionId: string;
    url: string;
}

export const subscriptionService = {
    async getPlans() {
        return apiClient.get<Plan[]>('/api/v1/plans');
    },

    async getMySubscription() {
        return apiClient.get<Subscription>('/api/v1/subscriptions/me');
    },

    async createCheckoutSession(planId: string) {
        return apiClient.post<CheckoutSession>('/api/v1/subscriptions/checkout', {
            planId,
            successUrl: `${window.location.origin}/subscription?success=true`,
            cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        });
    },

    async cancelSubscription() {
        return apiClient.post('/api/v1/subscriptions/cancel');
    },

    async createPortalSession() {
        return apiClient.post<{ url: string }>('/api/v1/subscriptions/portal', {
            returnUrl: `${window.location.origin}/subscription`,
        });
    },
};

export type { Plan, Subscription, CheckoutSession };
