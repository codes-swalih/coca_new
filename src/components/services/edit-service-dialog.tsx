"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";

interface Service {
  _id: string;
  serviceTitle: string;
  serviceImage: string;
}

interface EditServiceDialogProps {
  service: Service;
  onSuccess: () => void;
}

export function EditServiceDialog({
  service,
  onSuccess,
}: EditServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceTitle: service.serviceTitle,
    serviceImage: service.serviceImage,
  });
  const { toast } = useToast();

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await convertToBase64(file);
        setFormData({ ...formData, serviceImage: base64String });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process image",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/services/${service._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Service updated successfully",
        });
        setOpen(false);
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to update service",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update service",
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
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update the service details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="serviceTitle">Title</label>
            <Input
              id="serviceTitle"
              value={formData.serviceTitle}
              onChange={(e) =>
                setFormData({ ...formData, serviceTitle: e.target.value })
              }
              placeholder="Enter service title"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="serviceImage">Service Image</label>
            <Input
              id="serviceImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {formData.serviceImage && (
              <div className="mt-2">
                <img
                  src={formData.serviceImage}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}