import type { Role } from '../constants/roles';
import type { SubscriptionStatus } from '../constants/status';

/**
 * User entity
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    planId: string | null;
    subscriptionStatus: SubscriptionStatus;
    stripeCustomerId: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User creation input
 */
export interface CreateUserInput {
    email: string;
    password: string;
    name: string;
}

/**
 * User update input
 */
export interface UpdateUserInput {
    email?: string;
    name?: string;
    role?: Role;
    planId?: string | null;
}

/**
 * User without sensitive fields (for API responses)
 */
export type SafeUser = Omit<User, 'stripeCustomerId'>;
