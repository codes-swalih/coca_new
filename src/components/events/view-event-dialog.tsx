"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ViewEventDialogProps {
  eventId: string;
}

export function ViewEventDialog({ eventId }: ViewEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchEventDetails();
    }
  }, [open]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/admin/cocaEvents/${eventId}`);
      const data = await response.json();

      if (data.status === "Success") {
        setEvent(data.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch event details",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch event details",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="hover:bg-primary/10 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Event Details
          </DialogTitle>
        </DialogHeader>
        {event && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event Title</h3>
              <p className="text-lg font-medium">{event.eventTitle}</p>
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Date</h3>
              <p className="text-lg">{format(new Date(event.date), "PPP")}</p>
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Location</h3>
              <p className="text-lg">{event.location}</p>
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">About Event</h3>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{event.aboutEvent}</p>
            </div>
            {event.eventImage && (
              <div className="grid gap-1.5">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event Image</h3>
                <div className="relative w-full h-[300px] overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={event.eventImage}
                    alt={event.eventTitle}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}