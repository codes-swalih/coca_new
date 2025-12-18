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

interface Advertisement {
  _id: string;
  image: string;
  link: string;
}

interface ViewAdvertisementDialogProps {
  advertisement: Advertisement;
}

export function ViewAdvertisementDialog({
  advertisement,
}: ViewAdvertisementDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs" className="h-7 w-7">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>View Advertisement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Advertisement Image</h4>
            <img
              src={advertisement.image}
              alt="Advertisement"
              className="mt-2 rounded-md w-full h-auto"
            />
          </div>
          <div>
            <h4 className="font-medium">Link</h4>
            <a
              href={advertisement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {advertisement.link}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}