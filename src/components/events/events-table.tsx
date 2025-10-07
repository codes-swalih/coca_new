"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { AddEventDialog } from "./add-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";
import { ViewEventDialog } from "./view-event-dialog";

interface CocaEvent {
  _id: string;
  eventTitle: string;
  date: string;
  location: string;
  aboutEvent: string;
  eventImage: string;
}

export function EventsTable() {
  const [events, setEvents] = useState<CocaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/cocaEvents");
      const data = await response.json();
      
      if (data.status === "Success") {
        const filteredEvents = data.data.filter((event: CocaEvent) =>
          event.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setEvents(filteredEvents);
      } else {
        toast({
          variant: "destructive",
          title: "Error fetching events",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/cocaEvents/${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        fetchEvents();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete event",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search events..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <AddEventDialog onSuccess={fetchEvents} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>About</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell className="font-medium">{event.eventTitle}</TableCell>
                <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell className="truncate max-w-xs">{event.aboutEvent}</TableCell>
                
                <TableCell className="text-right space-x-2">
                  <ViewEventDialog eventId={event._id} />
                  <EditEventDialog eventId={event._id} onSuccess={fetchEvents} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the event.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(event._id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>

                
                {/* <AddEventDialog onSuccess={fetchEvents} /> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}