// lib/permissions.ts
// Centralized permission configuration

export const ROLES = {
    MANAGER: 'MANAGER',
    WORKER: 'WORKER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define route permissions - single source of truth
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
    '/dashboard/user': [ROLES.MANAGER],
    // Add more protected routes here
    // '/dashboard/settings': [ROLES.MANAGER],
    // '/dashboard/reports': [ROLES.MANAGER],
};

// Helper function to check if user has access to a route
export function hasRouteAccess(route: string, userRole?: string): boolean {
    if (!userRole) return false;

    // Check if route matches any protected route
    for (const [protectedRoute, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
        if (route.startsWith(protectedRoute)) {
            return allowedRoles.includes(userRole as Role);
        }
    }

    // If route not in config, allow access by default
    return true;
}

// Get all manager-only routes
export function getManagerOnlyRoutes(): string[] {
    return Object.entries(ROUTE_PERMISSIONS)
        .filter(([_, roles]) => roles.length === 1 && roles[0] === ROLES.MANAGER)
        .map(([route]) => route);
}