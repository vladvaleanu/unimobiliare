/**
 * User roles for authentication and authorization
 * @description RBAC roles - never use raw strings for role checks
 */
export const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy for permission checks
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
    [ROLES.USER]: 1,
    [ROLES.ADMIN]: 10,
} as const;
