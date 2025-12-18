"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  StoredAuthData,
  storeAuthData,
  getStoredAuthData,
  clearAuthData,
} from "@/lib/authStorage";

/**
 * Authenticated user interface
 */
export interface AuthUser {
  id: string;
  username: string;
  permissions: string[];
}

/**
 * Admin login response structure from the API
 */
export interface AdminLoginResponse {
  _id: string;
  username: string;
  role?: {
    categories?: string[];
  };
}

/**
 * Auth context type definition
 */
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (adminData: AdminLoginResponse) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

/**
 * Default context value
 */
const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  hasAnyPermission: () => false,
};

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType>(defaultContextValue);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Provides authentication state and helper functions throughout the application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const storedData = getStoredAuthData();
    if (storedData) {
      setUser({
        id: storedData.id,
        username: storedData.username,
        permissions: storedData.permissions,
      });
    }
    setIsLoading(false);
  }, []);

  /**
   * Login function - stores auth data and updates state
   * @param adminData - Admin data from login API response
   */
  const login = useCallback((adminData: AdminLoginResponse) => {
    const permissions = adminData.role?.categories ?? [];
    
    const authData: StoredAuthData = {
      id: adminData._id,
      username: adminData.username,
      permissions,
    };

    // Store in localStorage
    storeAuthData(authData);

    // Update state
    setUser({
      id: authData.id,
      username: authData.username,
      permissions: authData.permissions,
    });
  }, []);

  /**
   * Logout function - clears storage and resets state
   */
  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
  }, []);

  /**
   * Check if user has a specific permission
   * @param permission - Permission string to check
   * @returns true if user has the permission
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  /**
   * Check if user has any of the specified permissions
   * @param permissions - Array of permission strings to check
   * @returns true if user has at least one of the permissions
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return permissions.some((permission) => user.permissions.includes(permission));
    },
    [user]
  );

  const isAuthenticated = user !== null;

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
    }),
    [user, isAuthenticated, isLoading, login, logout, hasPermission, hasAnyPermission]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @returns Auth context value
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
