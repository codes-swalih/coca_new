"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface Service {
  _id: string;
  serviceTitle: string;
  serviceImage: string;
}

interface ViewServiceDialogProps {
  service: Service;
}

export function ViewServiceDialog({
  service,
}: ViewServiceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>View Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Service Image</h4>
            <img
              src={service.serviceImage}
              alt="Service"
              className="mt-2 rounded-md w-full h-auto"
            />
          </div>
          <div>
            <h4 className="font-medium">Title</h4>
            <p className="mt-1">{service.serviceTitle}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}