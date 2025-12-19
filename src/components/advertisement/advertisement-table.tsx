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

import { AddAdvertisementDialog } from "./add-advertisement-dialog";
import { EditAdvertisementDialog } from "./edit-advertisement-dialog";
import { ViewAdvertisementDialog } from "./view-advertisement-dialog";

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export function AdvertisementTable() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdvertisements();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch("/api/admin/advertisements");
      const data = await response.json();
      
      if (data.status === "Success") {
        const filteredAds = data.data.filter((ad: Advertisement) =>
          ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.link?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setAdvertisements(filteredAds);
      } else {
        toast({
          variant: "destructive",
          title: "Error fetching advertisements",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch advertisements",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId: string) => {
    try {
      const response = await fetch(`/api/admin/advertisements/${adId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Advertisement deleted successfully",
        });
        fetchAdvertisements();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete advertisement",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete advertisement",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search advertisements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <AddAdvertisementDialog onSuccess={fetchAdvertisements} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : advertisements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No advertisements found.
                </TableCell>
              </TableRow>
            ) : (
              advertisements.map((ad) => (
                <TableRow key={ad._id}>
                  <TableCell>
                    <img
                      src={ad.image}
                      alt="Advertisement"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {ad.title || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {ad.description || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      title={ad.link}
                    >
                      {ad.link?.length > 30 ? `${ad.link.substring(0, 30)}...` : ad.link}
                    </a>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <ViewAdvertisementDialog advertisement={ad} />
                    <EditAdvertisementDialog
                      advertisement={ad}
                      onSuccess={fetchAdvertisements}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="xs" className="text-muted-foreground hover:text-red-600 hover:bg-red-50 h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Advertisement
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this advertisement?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(ad._id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}