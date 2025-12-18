/**
 * Permission-based authorization configuration
 * Centralizes all permission types, navigation items, and route-permission mappings
 */

/**
 * All available permission types in the system
 */
export const PERMISSIONS = [
  "club_management",
  "role_management",
  "user_management",
  "booking_management",
  "member_management",
  "zone_management",
  "event_management",
  "financial_reports",
  "system_settings",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Navigation item configuration
 */
export interface NavItem {
  path: string;
  label: string;
  icon: string;
  permission: Permission | null; // null means always visible (e.g., Dashboard)
}

/**
 * Navigation items with their required permissions
 * Items with permission: null are always visible to authenticated users
 */
export const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", permission: null },
  { path: "/members", label: "Members", icon: "Users", permission: "member_management" },
  { path: "/club-management", label: "Club Management", icon: "Building2", permission: "club_management" },
  { path: "/cocaEvents", label: "Coca Events", icon: "Calendar", permission: "event_management" },
  { path: "/advertisement", label: "Advertisements", icon: "ChartBar", permission: "club_management" },
  { path: "/services", label: "Services", icon: "Workflow", permission: "club_management" },
  { path: "/zone-management", label: "Zone Management", icon: "MapPin", permission: "zone_management" },
  { path: "/bookings", label: "Bookings", icon: "BookOpen", permission: "booking_management" },
  { path: "/role-management", label: "Role Management", icon: "Shield", permission: "role_management" },
];

/**
 * Route-to-permission mapping for route protection
 * Routes not listed here are accessible to all authenticated users
 */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/members": "member_management",
  "/club-management": "club_management",
  "/cocaEvents": "event_management",
  "/advertisement": "club_management",
  "/services": "club_management",
  "/zone-management": "zone_management",
  "/bookings": "booking_management",
  "/role-management": "role_management",
};

/**
 * Filter navigation items based on user permissions
 * @param permissions - Array of permission strings the user has
 * @returns Filtered array of NavItems the user can access
 */
export function filterNavItemsByPermissions(permissions: string[]): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => item.permission === null || permissions.includes(item.permission)
  );
}

/**
 * Check if a user has permission to access a specific route
 * @param route - The route path to check
 * @param permissions - Array of permission strings the user has
 * @returns true if user can access the route, false otherwise
 */
export function hasRoutePermission(route: string, permissions: string[]): boolean {
  const requiredPermission = ROUTE_PERMISSIONS[route];
  // If route is not in the mapping, it's accessible to all authenticated users
  if (!requiredPermission) {
    return true;
  }
  return permissions.includes(requiredPermission);
}

/**
 * Get the required permission for a route
 * @param route - The route path to check
 * @returns The required permission or undefined if no permission required
 */
export function getRoutePermission(route: string): Permission | undefined {
  return ROUTE_PERMISSIONS[route];
}

/**
 * Complete permission configuration object
 */
export interface PermissionConfig {
  permissions: readonly string[];
  navItems: NavItem[];
  routePermissions: Record<string, string>;
}

export const permissionConfig: PermissionConfig = {
  permissions: PERMISSIONS,
  navItems: NAV_ITEMS,
  routePermissions: ROUTE_PERMISSIONS,
};
