"use client";

import { MembersTable } from "@/components/members/members-table";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function MembersPage() {
  return (
    <RouteGuard requiredPermission="member_management">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        </div>
        <div className="">
          <MembersTable />
        </div>
      </div>
    </RouteGuard>
  );
}