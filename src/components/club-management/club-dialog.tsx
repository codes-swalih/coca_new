'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Check, ChevronDown, X, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Member {
  _id: string;
  nameOfBusinessOwner: string;
  designation: string;
  email: string;
}

interface Event {
  _id: string;
  eventTitle: string;
  date: string;
  location: string;
}

interface Role {
  _id: string;
  title: string;
  categories: string[];
}

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

interface ClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club?: Club | null;
  onSuccess: () => void;
}

export function ClubDialog({ open, onOpenChange, club, onSuccess }: ClubDialogProps) {
  const [clubName, setClubName] = useState('');
  const [since, setSince] = useState('');
  const [clubManager, setClubManager] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [image, setImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Dropdown states
  const [clubManagerOpen, setClubManagerOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  
  // Data for dropdowns
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Admin account fields
  const [createAdminAccount, setCreateAdminAccount] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState('');

  const isEditing = !!club;

  // Fetch members, events, and roles data
  useEffect(() => {
    if (open) {
      fetchMembers();
      fetchEvents();
      fetchRoles();
    }
  }, [open]);

  // Reset admin fields when manager changes or dialog closes
  useEffect(() => {
    if (!open) {
      setCreateAdminAccount(false);
      setAdminUsername('');
      setAdminPassword('');
      setAdminRole('');
    }
  }, [open]);

  // Auto-fill username when manager is selected and createAdminAccount is enabled
  useEffect(() => {
    if (createAdminAccount && clubManager) {
      const selectedMember = members.find(m => m._id === clubManager);
      if (selectedMember?.email) {
        setAdminUsername(selectedMember.email);
      }
    }
  }, [clubManager, createAdminAccount, members]);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/membersListing');
      const data = await response.json();
      
      if (data?.status === "Success" && Array.isArray(data.data)) {
        const validMembers = data.data
          .filter((item: any) => item?.member_personal_detail?._id && item?.member_personal_detail?.nameOfBusinessOwner)
          .map((item: any) => ({
            _id: item.member_personal_detail._id,
            nameOfBusinessOwner: item.member_personal_detail.nameOfBusinessOwner,
            designation: item.member_personal_detail.designation || '',
            email: item.member_personal_detail.email || ''
          }));
        setMembers(validMembers);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      const data = await response.json();
      
      if (data?.status === "Success" && Array.isArray(data.data)) {
        const validEvents = data.data
          .filter((event: any) => event?._id && event?.eventTitle)
          .map((event: any) => ({
            _id: event._id,
            eventTitle: event.eventTitle,
            date: event.date || '',
            location: event.location || ''
          }));
        setEvents(validEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/admin/createRole');
      const data = await response.json();
      
      if (data?.status === "Success" && Array.isArray(data.data)) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.title : 'Unknown Role';
  };

  useEffect(() => {
    if (open) {
      if (club) {
        console.log('Editing club data:', club); // Debug log
        setClubName(club.clubName || '');
        setSince(club.since || '');

        // Handle club manager - check if it's a populated object or just an ID
        if (club.rawClubManager && typeof club.rawClubManager === 'object' && club.rawClubManager._id) {
          setClubManager(club.rawClubManager._id);
        } else if (typeof club.clubManager === 'object' && (club.clubManager as any)._id) {
          // Fallback: check if clubManager itself is a populated object
          setClubManager((club.clubManager as any)._id);
        } else if (typeof club.clubManager === 'string') {
          // Use the string value directly
          setClubManager(club.clubManager);
        } else {
          setClubManager('');
        }

        // Handle members - check if we have raw data
        if (club.rawMembers && Array.isArray(club.rawMembers)) {
          // Use raw member IDs from API
          setSelectedMembers(club.rawMembers.map(m => m._id));
        } else if (Array.isArray(club.members)) {
          setSelectedMembers(club.members);
        } else {
          setSelectedMembers([]);
        }

        // Handle events - check if we have raw data
        if (club.rawEvents && Array.isArray(club.rawEvents)) {
          // Use raw event IDs from API
          setSelectedEvents(club.rawEvents.map(e => e._id));
        } else if (Array.isArray(club.events)) {
          setSelectedEvents(club.events);
        } else {
          setSelectedEvents([]);
        }

        // Handle image - check if it's Base64 data or a filename
        if (club.image) {
          if (club.image.startsWith('data:image')) {
            // It's Base64 data
            setImage(club.image);
            setImagePreview('Uploaded Image');
          } else {
            // It's a filename or URL
            setImage(club.image);
            setImagePreview(club.image);
          }
        } else {
          setImage('');
          setImagePreview('');
        }
      } else {
        setClubName('');
        setSince('');
        setClubManager('');
        setSelectedMembers([]);
        setSelectedEvents([]);
        setImage('');
        setImagePreview('');
      }
    }
  }, [open, club]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim() || !since.trim() || !clubManager.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Club Name, Since, and Club Manager).",
        variant: "destructive",
      });
      return;
    }

    // Validate admin account fields if enabled
    if (createAdminAccount && !isEditing) {
      if (!adminUsername.trim() || !adminPassword.trim() || !adminRole) {
        toast({
          title: "Validation Error",
          description: "Please fill in all admin account fields (Username, Password, and Role).",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/admin/clubs/${club._id}` : '/api/admin/clubs';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubName: clubName.trim(),
          since: since.trim(),
          clubManager: clubManager.trim(),
          members: selectedMembers,
          events: selectedEvents,
          image: image.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If admin account creation is enabled, create the admin
        if (createAdminAccount && !isEditing) {
          try {
            const adminResponse = await fetch('/api/admin/admin/createAdmin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: adminUsername.trim(),
                password: adminPassword.trim(),
                role: adminRole,
              }),
            });

            const adminData = await adminResponse.json();

            if (adminResponse.ok) {
              toast({
                title: "Success",
                description: "Club created and admin account set up successfully.",
              });
            } else {
              toast({
                title: "Partial Success",
                description: `Club created, but admin account failed: ${adminData.message}`,
                variant: "destructive",
              });
            }
          } catch (adminError) {
            toast({
              title: "Partial Success",
              description: "Club created, but admin account creation failed.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: isEditing ? "Club Updated" : "Club Created",
            description: data.message || `Club ${isEditing ? 'updated' : 'created'} successfully.`,
          });
        }

        onSuccess();
        if (!isEditing) {
          setClubName('');
          setSince('');
          setClubManager('');
          setSelectedMembers([]);
          setSelectedEvents([]);
          setImage('');
          setCreateAdminAccount(false);
          setAdminUsername('');
          setAdminPassword('');
          setAdminRole('');
        }
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${isEditing ? 'update' : 'create'} club.`,
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
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m._id === memberId);
    return member ? member.nameOfBusinessOwner : 'Unknown Member';
  };

  const getEventTitle = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    return event ? event.eventTitle : 'Unknown Event';
  };

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
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Image size must be less than 5MB",
          });
          return;
        }

        const base64String = await convertToBase64(file);
        setImage(base64String);
        setImagePreview(file.name);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process image",
        });
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isEditing ? 'Edit Club' : 'Club Management'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Edit club information' : 'Manage all clubs and add new ones'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clubName">Club Name *</Label>
                  <Input
                    id="clubName"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Enter club name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="since">Since *</Label>
                  <Input
                    id="since"
                    value={since}
                    onChange={(e) => setSince(e.target.value)}
                    placeholder="e.g., 2020, January 2020"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Club Manager *</Label>
                <Popover open={clubManagerOpen} onOpenChange={setClubManagerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clubManagerOpen}
                      className="w-full justify-between"
                    >
                      {clubManager ? getMemberName(clubManager) : "Select club manager..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search members..." className="h-9" />
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandList>
                        <ScrollArea className="h-48">
                          <CommandGroup>
                            {members.map((member) => (
                              <CommandItem
                                key={member._id}
                                value={member.nameOfBusinessOwner}
                                onSelect={() => {
                                  setClubManager(member._id);
                                  setClubManagerOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    clubManager === member._id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{member.nameOfBusinessOwner}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {member.designation} • {member.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Admin Account Section - Only show when creating new club and manager is selected */}
              {!isEditing && clubManager && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createAdmin"
                      checked={createAdminAccount}
                      onCheckedChange={(checked) => setCreateAdminAccount(checked === true)}
                    />
                    <Label htmlFor="createAdmin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4 text-primary" />
                      Create Admin Account for Manager
                    </Label>
                  </div>

                  {createAdminAccount && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="adminUsername">Username *</Label>
                          <Input
                            id="adminUsername"
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                            placeholder="Enter username (email recommended)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adminPassword">Password *</Label>
                          <Input
                            id="adminPassword"
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Enter password"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Role *</Label>
                        <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={roleOpen}
                              className="w-full justify-between"
                            >
                              {adminRole ? getRoleName(adminRole) : "Select role..."}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search roles..." className="h-9" />
                              <CommandEmpty>No role found.</CommandEmpty>
                              <CommandList>
                                <ScrollArea className="h-48">
                                  <CommandGroup>
                                    {roles.map((role) => (
                                      <CommandItem
                                        key={role._id}
                                        value={role.title}
                                        onSelect={() => {
                                          setAdminRole(role._id);
                                          setRoleOpen(false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            adminRole === role._id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium">{role.title}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {role.categories?.join(', ') || 'No permissions'}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This will create an admin account allowing the manager to log in to the admin panel.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Members</Label>
                <Popover open={membersOpen} onOpenChange={setMembersOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={membersOpen}
                      className="w-full justify-between"
                    >
                      {selectedMembers.length > 0
                        ? `${selectedMembers.length} member(s) selected`
                        : "Select members..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search members..." className="h-9" />
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandList>
                        <ScrollArea className="h-48">
                          <CommandGroup>
                            {members.map((member) => (
                              <CommandItem
                                key={member._id}
                                value={member.nameOfBusinessOwner}
                                onSelect={() => {
                                  const newMembers = selectedMembers.includes(member._id)
                                    ? selectedMembers.filter(id => id !== member._id)
                                    : [...selectedMembers, member._id];
                                  setSelectedMembers(newMembers);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedMembers.includes(member._id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{member.nameOfBusinessOwner}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {member.designation} • {member.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Selected Members Display */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map((memberId) => (
                      <Badge key={memberId} variant="secondary" className="gap-1">
                        {getMemberName(memberId)}
                        <button
                          type="button"
                          onClick={() => setSelectedMembers(selectedMembers.filter(id => id !== memberId))}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Events</Label>
                <Popover open={eventsOpen} onOpenChange={setEventsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={eventsOpen}
                      className="w-full justify-between"
                    >
                      {selectedEvents.length > 0
                        ? `${selectedEvents.length} event(s) selected`
                        : "Select events..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search events..." className="h-9" />
                      <CommandEmpty>No event found.</CommandEmpty>
                      <CommandList>
                        <ScrollArea className="h-48">
                          <CommandGroup>
                            {events.map((event) => (
                              <CommandItem
                                key={event._id}
                                value={event.eventTitle}
                                onSelect={() => {
                                  const newEvents = selectedEvents.includes(event._id)
                                    ? selectedEvents.filter(id => id !== event._id)
                                    : [...selectedEvents, event._id];
                                  setSelectedEvents(newEvents);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedEvents.includes(event._id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{event.eventTitle}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {event.date} • {event.location}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Selected Events Display */}
                {selectedEvents.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEvents.map((eventId) => (
                      <Badge key={eventId} variant="secondary" className="gap-1">
                        {getEventTitle(eventId)}
                        <button
                          type="button"
                          onClick={() => setSelectedEvents(selectedEvents.filter(id => id !== eventId))}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Club Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {image && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Selected: {imagePreview}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImage('');
                          setImagePreview('');
                        }}
                        className="h-6 px-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF, WebP (Max size: 5MB)
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (isEditing ? 'Update Club' : 'Create Club')}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
