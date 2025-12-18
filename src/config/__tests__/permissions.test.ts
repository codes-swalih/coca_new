import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  filterNavItemsByPermissions,
  NAV_ITEMS,
  PERMISSIONS,
} from '../permissions';

/**
 * **Feature: permission-based-authorization, Property 3: Navigation filtering matches permissions**
 * 
 * *For any* set of permissions, the filtered navigation items SHALL contain exactly those items
 * whose required permission is either null (always visible) or is included in the permissions set.
 * 
 * **Validates: Requirements 2.1**
 */
describe('Navigation Filtering Property Tests', () => {
  // Generator for a subset of valid permissions
  const permissionSubsetArb = fc.subarray([...PERMISSIONS], { minLength: 0 });

  it('Property 3: Navigation filtering matches permissions - filtered items contain only authorized items', () => {
    fc.assert(
      fc.property(permissionSubsetArb, (permissions: string[]) => {
        const filteredItems = filterNavItemsByPermissions(permissions);

        // Every filtered item should either have null permission or be in the permissions set
        for (const item of filteredItems) {
          const isAlwaysVisible = item.permission === null;
          const hasPermission = item.permission !== null && permissions.includes(item.permission);
          
          expect(isAlwaysVisible || hasPermission).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 3: Navigation filtering matches permissions - all authorized items are included', () => {
    fc.assert(
      fc.property(permissionSubsetArb, (permissions: string[]) => {
        const filteredItems = filterNavItemsByPermissions(permissions);
        const filteredPaths = new Set(filteredItems.map(item => item.path));

        // Every NAV_ITEM that should be visible must be in the filtered result
        for (const item of NAV_ITEMS) {
          const shouldBeVisible = item.permission === null || permissions.includes(item.permission);
          
          if (shouldBeVisible) {
            expect(filteredPaths.has(item.path)).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 3: Navigation filtering matches permissions - exact match of expected items', () => {
    fc.assert(
      fc.property(permissionSubsetArb, (permissions: string[]) => {
        const filteredItems = filterNavItemsByPermissions(permissions);
        
        // Calculate expected items
        const expectedItems = NAV_ITEMS.filter(
          item => item.permission === null || permissions.includes(item.permission)
        );

        // The filtered items should exactly match the expected items
        expect(filteredItems.length).toBe(expectedItems.length);
        
        const filteredPaths = filteredItems.map(item => item.path).sort();
        const expectedPaths = expectedItems.map(item => item.path).sort();
        
        expect(filteredPaths).toEqual(expectedPaths);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 3: Dashboard is always visible regardless of permissions', () => {
    fc.assert(
      fc.property(permissionSubsetArb, (permissions: string[]) => {
        const filteredItems = filterNavItemsByPermissions(permissions);
        const dashboardItem = filteredItems.find(item => item.path === '/dashboard');
        
        // Dashboard should always be present
        expect(dashboardItem).toBeDefined();
        expect(dashboardItem?.permission).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 3: Empty permissions shows only null-permission items', () => {
    fc.assert(
      fc.property(fc.constant([]), (permissions: string[]) => {
        const filteredItems = filterNavItemsByPermissions(permissions);
        
        // All filtered items should have null permission
        for (const item of filteredItems) {
          expect(item.permission).toBeNull();
        }
        
        // Should include all null-permission items from NAV_ITEMS
        const nullPermissionItems = NAV_ITEMS.filter(item => item.permission === null);
        expect(filteredItems.length).toBe(nullPermissionItems.length);
      }),
      { numRuns: 100 }
    );
  });
});
