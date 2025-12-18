/**
 * Auth Storage Utilities
 * Manages authentication data persistence in localStorage
 */

const AUTH_STORAGE_KEY = "coca_admin_auth";

/**
 * Stored authentication data structure
 */
export interface StoredAuthData {
  id: string;
  username: string;
  permissions: string[];
}

/**
 * Type guard to validate stored auth data structure
 * @param data - Unknown data to validate
 * @returns True if data matches StoredAuthData structure
 */
export function isValidAuthData(data: unknown): data is StoredAuthData {
  if (data === null || typeof data !== "object") {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== "string" || obj.id.length === 0) {
    return false;
  }

  if (typeof obj.username !== "string" || obj.username.length === 0) {
    return false;
  }

  if (!Array.isArray(obj.permissions)) {
    return false;
  }

  // Validate all permissions are strings
  for (const permission of obj.permissions) {
    if (typeof permission !== "string") {
      return false;
    }
  }

  return true;
}

/**
 * Store authentication data in localStorage
 * @param data - Auth data to store
 */
export function storeAuthData(data: StoredAuthData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(AUTH_STORAGE_KEY, serialized);
  } catch {
    // localStorage unavailable or quota exceeded
    console.error("Failed to store auth data in localStorage");
  }
}

/**
 * Retrieve stored authentication data from localStorage
 * @returns Stored auth data or null if not found/invalid
 */
export function getStoredAuthData(): StoredAuthData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const serialized = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized);
    if (isValidAuthData(parsed)) {
      return parsed;
    }

    // Invalid data structure - clear it
    clearAuthData();
    return null;
  } catch {
    // JSON parse error or localStorage unavailable
    clearAuthData();
    return null;
  }
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // localStorage unavailable
    console.error("Failed to clear auth data from localStorage");
  }
}

/**
 * Export storage key for testing purposes
 */
export const AUTH_KEY = AUTH_STORAGE_KEY;
