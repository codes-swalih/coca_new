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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Filter, X } from "lucide-react";
import { EditMemberDialog } from "./edit-member-dialog";
import { AddMemberDialog } from "./add-member-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ViewMemberDialog } from "./view-member-dialog";

interface State {
  _id: string;
  stateName: string;
}

interface District {
  _id: string;
  districtName: string;
  state: string | { _id: string; stateName: string };
}

interface Zone {
  _id: string;
  zoneName: string;
  district: string | { _id: string; districtName: string };
  state: string | { _id: string; stateName: string };
}

interface Chapter {
  _id: string;
  chapterName: string;
  zone: string | { _id: string; zoneName: string };
  district: string | { _id: string; districtName: string };
  state: string | { _id: string; stateName: string };
}

interface Member {
  member_personal_detail: {
    nameOfBusinessOwner: string;
    designation: string;
    phone: string;
    email: string;
    memberId: string;
    secondaryPhone: string;
    _id: string;
    chapter?: string | { _id: string; chapterName: string; zone?: { _id: string }; };
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

  // Filter states
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Selected filter values
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  // Filtered options based on selections
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);

  // Show/hide filters
  const [showFilters, setShowFilters] = useState(false);

  const { toast } = useToast();

  // Fetch all filter data on mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [statesRes, districtsRes, zonesRes, chaptersRes] = await Promise.all([
          fetch("/api/admin/state"),
          fetch("/api/admin/district"),
          fetch("/api/admin/zone"),
          fetch("/api/admin/chapter"),
        ]);

        const [statesData, districtsData, zonesData, chaptersData] = await Promise.all([
          statesRes.json(),
          districtsRes.json(),
          zonesRes.json(),
          chaptersRes.json(),
        ]);

        if (statesData.status === "Success") setStates(statesData.data);
        if (districtsData.status === "Success") setDistricts(districtsData.data);
        if (zonesData.status === "Success") setZones(zonesData.data);
        if (chaptersData.status === "Success") setChapters(chaptersData.data);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  // Update filtered districts when state changes
  useEffect(() => {
    if (selectedState) {
      const filtered = districts.filter((d) => {
        const stateId = typeof d.state === "object" && d.state ? d.state._id : d.state;
        return stateId === selectedState;
      });
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }
    setSelectedDistrict("");
    setSelectedZone("");
    setSelectedChapter("");
  }, [selectedState, districts]);

  // Update filtered zones when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const filtered = zones.filter((z) => {
        const districtId = typeof z.district === "object" && z.district ? z.district._id : z.district;
        return districtId === selectedDistrict;
      });
      setFilteredZones(filtered);
    } else {
      setFilteredZones([]);
    }
    setSelectedZone("");
    setSelectedChapter("");
  }, [selectedDistrict, zones]);

  // Update filtered chapters when zone changes
  useEffect(() => {
    if (selectedZone) {
      const filtered = chapters.filter((c) => {
        const zoneId = typeof c.zone === "object" && c.zone ? c.zone._id : c.zone;
        return zoneId === selectedZone;
      });
      setFilteredChapters(filtered);
    } else {
      setFilteredChapters([]);
    }
    setSelectedChapter("");
  }, [selectedZone, chapters]);

  // Fetch members when search or filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMembers(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedState, selectedDistrict, selectedZone, selectedChapter]);

  const fetchMembers = async (page: number) => {
    try {
      let url = searchQuery
        ? `/api/admin/searchMember?keyword=${encodeURIComponent(searchQuery)}`
        : `/api/admin/membersListing?page=${page}&limit=100`; // Fetch more for filtering

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "Success" || data.data) {
        let filteredMembers = data.data;

        // Apply filters based on chapter hierarchy
        if (selectedChapter) {
          filteredMembers = filteredMembers.filter((m: Member) => {
            const chapterId = typeof m.member_personal_detail.chapter === "object" && m.member_personal_detail.chapter
              ? m.member_personal_detail.chapter._id
              : m.member_personal_detail.chapter;
            return chapterId === selectedChapter;
          });
        } else if (selectedZone) {
          filteredMembers = filteredMembers.filter((m: Member) => {
            if (!m.member_personal_detail.chapter) return false;
            const chapter = chapters.find(c => {
              const chapterId = typeof m.member_personal_detail.chapter === "object" && m.member_personal_detail.chapter
                ? m.member_personal_detail.chapter._id
                : m.member_personal_detail.chapter;
              return c._id === chapterId;
            });
            if (!chapter) return false;
            const zoneId = typeof chapter.zone === "object" && chapter.zone ? chapter.zone._id : chapter.zone;
            return zoneId === selectedZone;
          });
        } else if (selectedDistrict) {
          filteredMembers = filteredMembers.filter((m: Member) => {
            if (!m.member_personal_detail.chapter) return false;
            const chapter = chapters.find(c => {
              const chapterId = typeof m.member_personal_detail.chapter === "object" && m.member_personal_detail.chapter
                ? m.member_personal_detail.chapter._id
                : m.member_personal_detail.chapter;
              return c._id === chapterId;
            });
            if (!chapter) return false;
            const districtId = typeof chapter.district === "object" && chapter.district ? chapter.district._id : chapter.district;
            return districtId === selectedDistrict;
          });
        } else if (selectedState) {
          filteredMembers = filteredMembers.filter((m: Member) => {
            if (!m.member_personal_detail.chapter) return false;
            const chapter = chapters.find(c => {
              const chapterId = typeof m.member_personal_detail.chapter === "object" && m.member_personal_detail.chapter
                ? m.member_personal_detail.chapter._id
                : m.member_personal_detail.chapter;
              return c._id === chapterId;
            });
            if (!chapter) return false;
            const stateId = typeof chapter.state === "object" && chapter.state ? chapter.state._id : chapter.state;
            return stateId === selectedState;
          });
        }

        setMembers(filteredMembers);

        // For filtered results, show all on one page for simplicity
        if (selectedState || selectedDistrict || selectedZone || selectedChapter) {
          setTotalPages(1);
          setCurrentPage(1);
        } else if (!searchQuery) {
          setTotalPages(data.pagination?.totalPages || 1);
          setCurrentPage(page);
        } else {
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

  const clearFilters = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedZone("");
    setSelectedChapter("");
  };

  const hasActiveFilters = selectedState || selectedDistrict || selectedZone || selectedChapter;

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
          secondaryPhone: member.member_personal_detail.secondaryPhone || "",
          chapter: member.member_personal_detail.chapter
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
          email: memberData.email,
          chapter: memberData.chapter
        }),
      });

      const data = await response.json();

      if (data.status === "Success") {
        toast({
          title: "Success",
          description: "Member added successfully",
        });
        // Go to page 1 to see the newly added member
        setCurrentPage(1);
        fetchMembers(1);
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
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search members..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <AddMemberDialog onAdd={handleAdd} />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* State Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state._id} value={state._id}>
                      {state.stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">District</label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedState ? "Select district" : "Select state first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map((district) => (
                    <SelectItem key={district._id} value={district._id}>
                      {district.districtName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Zone</label>
              <Select
                value={selectedZone}
                onValueChange={setSelectedZone}
                disabled={!selectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedDistrict ? "Select zone" : "Select district first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredZones.map((zone) => (
                    <SelectItem key={zone._id} value={zone._id}>
                      {zone.zoneName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chapter</label>
              <Select
                value={selectedChapter}
                onValueChange={setSelectedChapter}
                disabled={!selectedZone}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedZone ? "Select chapter" : "Select zone first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredChapters.map((chapter) => (
                    <SelectItem key={chapter._id} value={chapter._id}>
                      {chapter.chapterName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {members.length} members
              </p>
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

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