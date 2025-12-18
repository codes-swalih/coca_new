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
import { Trash2 } from "lucide-react";
import { EditMemberDialog } from "./edit-member-dialog";
import { AddMemberDialog } from "./add-member-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ViewMemberDialog } from "./view-member-dialog";

interface Member {
  member_personal_detail: {
    nameOfBusinessOwner: string;
    designation: string;
    phone: string;
    email: string;
    memberId: string;
    secondaryPhone: string;
    _id: string;
  };
  member_business_detail: {
    nameOfBusiness: string;
    businessPhoneNumber: string;
    address: string;
  } | null;
}

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMembers(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchMembers = async (page: number) => {
    try {
      let url = searchQuery
        ? `/api/admin/searchMember?keyword=${encodeURIComponent(searchQuery)}`
        : `/api/admin/membersListing?page=${page}&limit=10`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === "Success" || data.data) {
        setMembers(data.data);
        // Only set pagination if not in search mode
        if (!searchQuery) {
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(page);
        } else {
          // For search results, we show all results on one page
          setTotalPages(1);
          setCurrentPage(1);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error fetching members",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch members",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (member: Member) => {
    try {
      const response = await fetch(`/api/admin/personal/${member.member_personal_detail._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfBusinessOwner: member.member_personal_detail.nameOfBusinessOwner,
          designation: member.member_personal_detail.designation,
          phone: member.member_personal_detail.phone,
          email: member.member_personal_detail.email,
          secondaryPhone: member.member_personal_detail.secondaryPhone || ""
        }),
      });

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Member updated successfully",
        });
        fetchMembers(currentPage);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to update member",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update member",
      });
    }
  };

  const handleDelete = async (memberId: string) => {
    try {
      const response = await fetch(`/api/admin/personal/${memberId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Member deleted successfully",
        });
        fetchMembers(currentPage);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete member",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete member",
      });
    }
  };

  const handleAdd = async (memberData: any) => {
    try {
      const response = await fetch("/api/admin/personal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfBusinessOwner: memberData.nameOfBusinessOwner,
          designation: memberData.designation,
          phone: memberData.phone,
          secondaryPhone: memberData.secondaryPhone || "", // Adding required secondaryPhone field
          email: memberData.email
        }),
      });

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Member added successfully",
        });
        fetchMembers(currentPage);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to add member",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add member",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search members..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <AddMemberDialog onAdd={handleAdd} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Owner</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              // Helper functions for formatting
              const formatName = (name: string) => {
                return name.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
              };

              const formatPhone = (phone: string) => {
                // Format phone as XXX-XXX-XXXX for better readability
                const cleaned = phone.replace(/\D/g, '');
                if (cleaned.length === 10) {
                  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
                }
                return phone;
              };



              return (
                <TableRow key={member.member_personal_detail.memberId}>
                  <TableCell className="font-medium">
                    {formatName(member.member_personal_detail.nameOfBusinessOwner)}
                  </TableCell>
                  <TableCell>
                    {member.member_business_detail?.nameOfBusiness || "—"}
                  </TableCell>
                  <TableCell>
                    {formatPhone(member.member_personal_detail.phone)}
                  </TableCell>
                  <TableCell>
                    {member.member_personal_detail.email}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <ViewMemberDialog memberId={member.member_personal_detail.memberId} />
                    <EditMemberDialog member={member} onSave={handleEdit} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="xs" className="text-muted-foreground hover:text-red-600 hover:bg-red-50 h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the member's data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(member.member_personal_detail._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => fetchMembers(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => fetchMembers(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}