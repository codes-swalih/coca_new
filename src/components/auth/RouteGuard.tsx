"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoutePermission } from "@/config/permissions";
import { getStoredAuthData } from "@/lib/authStorage";

/**
 * RouteGuard Props
 */
export interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * RouteGuard Component
 * Protects routes based on authentication status and permissions.
 * 
 * Behavior:
 * - If unauthenticated: redirects to /login
 * - If authenticated without required permission: redirects to /dashboard
 * - If authenticated with required permission: renders children
 * - Shows loading state while checking auth
 * 
 * @param children - Content to render if authorized
 * @param requiredPermission - Optional permission override. If not provided, 
 *                             uses the route-permission mapping from config
 */
export function RouteGuard({ children, requiredPermission }: RouteGuardProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Determine the required permission for this route
  const effectivePermission = requiredPermission ?? getRoutePermission(pathname);

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) return;

    // Also check localStorage directly to handle race conditions after login
    const storedAuth = getStoredAuthData();
    const hasValidAuth = isAuthenticated || storedAuth !== null;

    // Redirect unauthenticated users to login
    if (!hasValidAuth) {
      router.replace("/login");
      return;
    }

    // Check permission if one is required
    const userPermissions = storedAuth?.permissions ?? [];
    const hasRequiredPermission = effectivePermission 
      ? hasPermission(effectivePermission) || userPermissions.includes(effectivePermission)
      : true;

    if (effectivePermission && !hasRequiredPermission) {
      router.replace("/dashboard");
      return;
    }

    setIsChecking(false);
  }, [isAuthenticated, isLoading, effectivePermission, hasPermission, router]);

  // Show loading state while checking auth
  if (isLoading || isChecking) {
    // Check localStorage to avoid flash - if auth exists, don't show spinner
    const storedAuth = getStoredAuthData();
    if (!storedAuth) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
  }

  // Don't render content if not authenticated (check both context and storage)
  const storedAuth = getStoredAuthData();
  if (!isAuthenticated && !storedAuth) {
    return null;
  }

  // Don't render content if user lacks required permission
  const userPermissions = storedAuth?.permissions ?? [];
  if (effectivePermission && !hasPermission(effectivePermission) && !userPermissions.includes(effectivePermission)) {
    return null;
  }

  // User is authorized, render children
  return <>{children}</>;
}

export default RouteGuard;
