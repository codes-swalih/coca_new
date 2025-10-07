import { EventsTable } from "@/components/events/events-table";

export default function EventsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Coca Events</h2>
      </div>
      <div className="space-y-4">
        <EventsTable />
      </div>
    </div>
  );
}