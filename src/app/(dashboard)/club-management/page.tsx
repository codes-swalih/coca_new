'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, ImageIcon, MapPin, Users, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { ClubDialog } from "@/components/club-management/club-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

interface Club {
  _id: string;
  clubName: string;
  since: string;
  clubManager: string;
  members: number;
  events: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  rawMembers?: any[]; // Array of populated member objects with _id, nameOfBusinessOwner, etc.
  rawEvents?: any[]; // Array of populated event objects with _id, eventTitle, etc.
  rawClubManager?: any; // Populated club manager object with _id, nameOfBusinessOwner, etc.
}

export default function ClubManagementPage() {
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [clubDialogOpen, setClubDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<any>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [detailedViewOpen, setDetailedViewOpen] = useState(false);

  // Handler functions for Add buttons
  const handleAddClub = () => {
    setEditingClub(null);
    setClubDialogOpen(true);
  };

  // Handler functions for Edit buttons
  const handleEditClub = (club: any) => {
    setEditingClub(club);
    setClubDialogOpen(true);
  };

  // Handler functions for Delete buttons
  const handleDeleteClub = (club: any) => {
    setClubToDelete(club);
    setDeleteDialogOpen(true);
  };

  // Handler functions for Detailed View
  const handleDetailedView = (club: Club) => {
    setSelectedClub(club);
    setDetailedViewOpen(true);
  };

  // Delete club function
  const deleteClub = async () => {
    if (!clubToDelete) return;

    try {
      const response = await fetch(`/api/admin/clubs/${clubToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Club Deleted",
          description: data.message || "Club deleted successfully.",
        });
        handleSuccess(); // Refresh the data
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete club.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setClubToDelete(null);
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredClubs(clubs);
      return;
    }

    const filtered = clubs.filter((club) => {
      const searchTerm = query.toLowerCase();
      return (
        club.clubName?.toLowerCase().includes(searchTerm) ||
        club.clubManager?.toLowerCase().includes(searchTerm)
      );
    });
    setFilteredClubs(filtered);
  };

  // Fetch clubs data
  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/admin/clubs');
      const data = await response.json();

      if (data?.status === "Success") {
        const clubsData = data.data || [];
        setClubs(clubsData);
        setFilteredClubs(clubsData);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle success callback
  const handleSuccess = () => {
    fetchClubs();
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Update filtered clubs when clubs data changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [clubs]);

  if (loading) {
    return (
      <RouteGuard requiredPermission="club_management">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Club Management</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermission="club_management">
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Club Management</h1>
      </div>

      {/* Search and Add Club */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clubs by name, manager..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>
        <Button onClick={handleAddClub} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Add Club
        </Button>
      </div>

      {/* All Clubs Table */}
      <Card className="shadow-sm border-2">
        <CardHeader className="bg-gradient-to-r from-primary/3 to-primary/5 border-b py-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Clubs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left text-sm font-normal text-muted-foreground/80">Image</th>
                  <th className="p-4 text-left text-sm font-normal text-muted-foreground/80">Club Details</th>
                  <th className="p-4 text-left text-sm font-normal text-muted-foreground/80">Manager & Since</th>
                  <th className="p-4 text-left text-sm font-normal text-muted-foreground/80">Members & Events</th>
                  <th className="p-4 text-left text-sm font-normal text-muted-foreground/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-medium">
                          {searchQuery ? "No clubs match your search" : "No clubs found"}
                        </p>
                        <p className="text-sm">
                          {searchQuery ? "Try adjusting your search terms" : "Add your first club above to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClubs.map((club) => (
                    <tr key={club._id} className="border-b hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-200 group">

                      {/* Image Column */}
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                          {club.image && (club.image.startsWith('data:image') || club.image.startsWith('http')) ? (
                            <img
                              src={club.image}
                              alt={club.clubName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full bg-muted flex items-center justify-center"><svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Club Details Column */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground group-hover:text-foreground text-lg">
                            {club.clubName || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Manager & Since Column */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground/90">
                            {club.clubManager || '—'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Since: {club.since || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Members & Events Column */}
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">{club.members || 0} Members</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">{club.events || 0} Events</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDetailedView(club)}
                            className="h-7 w-7"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditClub(club)}
                            className="h-7 w-7"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteClub(club)}
                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 h-7 w-7"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClubDialog
        open={clubDialogOpen}
        onOpenChange={setClubDialogOpen}
        club={editingClub}
        onSuccess={handleSuccess}
      />

      {/* Detailed View Dialog */}
      {selectedClub && (
        <Dialog open={detailedViewOpen} onOpenChange={setDetailedViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Club Details: {selectedClub.clubName}
              </DialogTitle>
              <DialogDescription>
                Comprehensive information about the selected club
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-muted-foreground">Club Name:</span>
                        <span className="font-semibold">{selectedClub.clubName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-muted-foreground">Since:</span>
                        <span className="font-semibold">{selectedClub.since || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-muted-foreground">Club Manager:</span>
                        <span className="font-semibold">{selectedClub.clubManager || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-muted-foreground">Total Members:</span>
                        <Badge variant="secondary" className="font-semibold">
                          {selectedClub.members || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-muted-foreground">Total Events:</span>
                        <Badge variant="secondary" className="font-semibold">
                          {selectedClub.events || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Club Image
                    </h3>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      {selectedClub.image ? (
                        <div className="space-y-3">
                          <div className="w-full h-48 rounded-lg overflow-hidden border border-border">
                            {selectedClub.image.startsWith('http') || selectedClub.image.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedClub.image) ? (
                              <img
                                src={selectedClub.image}
                                alt={selectedClub.clubName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNCAxNEMxNCAxMi4yMzkxIDE1LjIzOTEgMTEgMTggMTFIMzBDMzIuNzYwOSAxMSAzNCAxMi4yMzkxIDM0IDE0VjM0QzM0IDM2Ljc2MDkgMzIuNzYwOSAzOCAzMCAzOEgxOEMxNS4yMzkxIDM4IDE0IDM2Ljc2MDkgMTQgMzRWMTRaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNEMxOCAxMi4yMzkxIDE5LjIzOTEgMTEgMjIgMTFIMzBDMzIuNzYwOSAxMSAzNCAxMi4yMzkxIDM0IDE0VjM0QzM0IDM2Ljc2MDkgMzIuNzYwOSAzOCAzMCAzOEgyMkMyMC4yMzkxIDM4IDE5IDM2Ljc2MDkgMTkgMzRWMTRaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMiAxNEMyMiAxMi4yMzkxIDIzLjIzOTEgMTEgMjYgMTFIMzBDMzIuNzYwOSAxMSAzNCAxMi4yMzkxIDM0IDE0VjM0QzM0IDM2Ljc2MDkgMzIuNzYwOSAzOCAzMCAzOEgyNkMyNC4yMzkxIDM4IDIzIDM2Ljc2MDkgMjMgMzRWMTRaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <div className="text-center">
                                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                  <span className="text-sm text-muted-foreground">File: {selectedClub.image}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <strong>Image:</strong> {selectedClub.image}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <span className="text-muted-foreground">No image uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Created:</span>
                    <div className="mt-1">
                      {selectedClub.createdAt ? (
                        <div>
                          <div className="font-semibold">
                            {new Date(selectedClub.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedClub.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                  {selectedClub.updatedAt && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-muted-foreground">Last Updated:</span>
                      <div className="mt-1">
                        <div className="font-semibold">
                          {new Date(selectedClub.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(selectedClub.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Members List */}
              {selectedClub.rawMembers && selectedClub.rawMembers.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Club Members
                  </h3>
                  <div className="space-y-2">
                    {selectedClub.rawMembers.map((member: any, index: number) => (
                      <div key={member._id || index} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {member.nameOfBusinessOwner ? member.nameOfBusinessOwner.charAt(0).toUpperCase() : 'M'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {member.nameOfBusinessOwner || 'Unknown Member'}
                              </div>
                              {member.designation && (
                                <div className="text-sm text-muted-foreground">
                                  {member.designation}
                                </div>
                              )}
                            </div>
                          </div>
                          {member.email && (
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Club Members
                  </h3>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
                    <span className="text-muted-foreground">No members assigned to this club</span>
                  </div>
                </div>
              )}

              {/* Events List */}
              {selectedClub.rawEvents && selectedClub.rawEvents.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Club Events
                  </h3>
                  <div className="space-y-2">
                    {selectedClub.rawEvents.map((event: any, index: number) => (
                      <div key={event._id || index} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {event.eventTitle ? event.eventTitle.charAt(0).toUpperCase() : 'E'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {event.eventTitle || 'Unknown Event'}
                              </div>
                              {event.date && (
                                <div className="text-sm text-muted-foreground">
                                  {event.date}
                                </div>
                              )}
                            </div>
                          </div>
                          {event.location && (
                            <div className="text-sm text-muted-foreground">
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Club Events
                  </h3>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
                    <span className="text-muted-foreground">No events assigned to this club</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the club
              "{clubToDelete?.clubName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteClub} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RouteGuard>
  );
}
