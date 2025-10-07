import { Metadata } from "next";
import { MembersTable } from "@/components/members/members-table";

export const metadata: Metadata = {
  title: "Members | COCA Admin",
  description: "Manage COCA members",
};

export default function MembersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
      </div>
      <div className="">
        <MembersTable />
      </div>
    </div>
  );
}