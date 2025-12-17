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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";

interface EditEventDialogProps {
  eventId: string;
  onSuccess: () => void;
}

export function EditEventDialog({ eventId, onSuccess }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    eventTitle: "",
    date: "",
    location: "",
    aboutEvent: "",
    eventImage: "",
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await convertToBase64(file);
        setFormData({ ...formData, eventImage: base64String });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process image",
        });
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

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
        setFormData(data.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/cocaEvents/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
        setOpen(false);
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to update event",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs" className="h-7 w-7">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title</Label>
            <Input
              id="eventTitle"
              value={formData.eventTitle}
              onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date.split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aboutEvent">About Event</Label>
            <Textarea
              id="aboutEvent"
              value={formData.aboutEvent}
              onChange={(e) => setFormData({ ...formData, aboutEvent: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventImage">Event Image</Label>
            <div className="space-y-2">
              {formData.eventImage && (
                <img 
                  src={formData.eventImage} 
                  alt="Event preview" 
                  className="w-full h-40 object-cover rounded-md"
                />
              )}
              <Input
                id="eventImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}