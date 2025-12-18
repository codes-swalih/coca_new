"use client";

import { AdvertisementTable } from "@/components/advertisement/advertisement-table";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function AdvertisementPage() {
  return (
    <RouteGuard requiredPermission="club_management">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Advertisement</h2>
        </div>
        <div className="space-y-4">
          <AdvertisementTable />
        </div>
      </div>
    </RouteGuard>
  );
}