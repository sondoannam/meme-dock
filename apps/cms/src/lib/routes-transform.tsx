import { RouteObject } from 'react-router-dom';

/**
 * DEPRECATED: This approach has been replaced by layout-based authentication
 *
 * Route protection is now handled in layout components instead of wrapping each route.
 * See the following layout implementations:
 * - /pages/layout.tsx - Root layout with global authentication state
 * - /pages/(auth)/layout.tsx - Authentication routes (redirects if already authenticated)
 * - /pages/(dashboard)/layout.tsx - Admin routes (checks admin permissions)
 *
 * Using layouts for authentication provides these benefits:
 * - More intuitive route organization using folder structure
 * - Avoid re-checking authentication on every route change within a section
 * - Better separation of concerns between routing and auth logic
 * - Easier to manage route-specific UI elements (like navigation)
 */

// Define route protection patterns
interface RoutePatternConfig {
  pattern: string | RegExp;
  requireAuth: boolean;
  requireAdmin: boolean;
}

// Route protection configuration reference
// These are now handled by their respective layout components
export const routeProtectionConfig: RoutePatternConfig[] = [
  // Public routes - no authentication required
  { pattern: '/login', requireAuth: false, requireAdmin: false },
  { pattern: '/unauthorized', requireAuth: false, requireAdmin: false },
  { pattern: '/reset-password', requireAuth: false, requireAdmin: false },
  { pattern: '/register', requireAuth: false, requireAdmin: false },

  // Dashboard and admin routes - require authentication and admin role
  { pattern: '/dashboard', requireAuth: true, requireAdmin: true },
  { pattern: '/media', requireAuth: true, requireAdmin: true },
  { pattern: '/users', requireAuth: true, requireAdmin: true },
  { pattern: '/settings', requireAuth: true, requireAdmin: true },
  { pattern: '/collections', requireAuth: true, requireAdmin: true },

  // Non-admin authenticated routes
  { pattern: '/profile', requireAuth: true, requireAdmin: false },

  // Default - require basic authentication for any other route
  { pattern: /.*/, requireAuth: true, requireAdmin: false },
];

/**
 * DEPRECATED: This function has been replaced by layout-based authentication
 *
 * Transform routes to add protection based on route paths
 * This function is kept for reference but is no longer used.
 * @param routes Array of route objects from ~pages
 * @returns Original routes (no transformation applied)
 */
export function withProtection(routes: RouteObject[]): RouteObject[] {
  // Simply return the routes as-is, protection is now handled at the layout level
  return routes;
}
