'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Plus, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface State {
  _id: string;
  stateName: string;
}

interface District {
  _id: string;
  districtName: string;
  state: State;
}

interface Zone {
  _id: string;
  zoneName: string;
  district: District;
  state: State;
  createdAt: string;
}

interface ZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: Zone | null;
  onSuccess: () => void;
}

export function ZoneDialog({ open, onOpenChange, zone, onSuccess }: ZoneDialogProps) {
  const [zoneName, setZoneName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zonesToDelete, setZonesToDelete] = useState<Zone | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const isEditing = !!zone;

  useEffect(() => {
    if (open) {
      fetchStates();
      fetchZones();
      if (zone) {
        setZoneName(zone.zoneName || '');
        setSelectedState(zone.state?._id || '');
        setSelectedDistrict(zone.district?._id || '');
        setActiveTab('form');
      } else {
        setZoneName('');
        setSelectedState('');
        setSelectedDistrict('');
        setActiveTab('list');
      }
    }
  }, [open, zone]);

  useEffect(() => {
    if (selectedState) {
      fetchDistrictsByState(selectedState);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/admin/state');
      const data = await response.json();
      if (data.status === 'Success') {
        setStates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchDistrictsByState = async (stateId: string) => {
    try {
      const response = await fetch('/api/admin/district');
      const data = await response.json();
      if (data.status === 'Success') {
        const filteredDistricts = data.data.filter((district: District) => district?.state?._id === stateId);
        setDistricts(filteredDistricts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/admin/zone');
      const data = await response.json();
      if (data.status === 'Success') {
        setZones(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || !selectedState || !selectedDistrict) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/admin/zone/${zone._id}` : '/api/admin/zone';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zoneName: zoneName.trim(),
          state: selectedState,
          district: selectedDistrict,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: isEditing ? "Zone Updated" : "Zone Created",
          description: data.message || `Zone ${isEditing ? 'updated' : 'created'} successfully.`,
        });
        onSuccess();
        if (!isEditing) {
          setZoneName('');
          setSelectedState('');
          setSelectedDistrict('');
        }
        setActiveTab('list');
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${isEditing ? 'update' : 'create'} zone.`,
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

  const handleDelete = async () => {
    if (!zonesToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/zone/${zonesToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Zone Deleted",
          description: data.message || "Zone deleted successfully.",
        });
        onSuccess();
        fetchZones();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete zone.",
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
      setDeleteDialogOpen(false);
      setZonesToDelete(null);
    }
  };

  const handleEdit = (zone: Zone) => {
    setZoneName(zone.zoneName || '');
    setSelectedState(zone.state?._id || '');
    setSelectedDistrict(zone.district?._id || '');
    setActiveTab('form');
  };

  const handleAddNew = () => {
    setZoneName('');
    setSelectedState('');
    setSelectedDistrict('');
    setActiveTab('form');
  };

  const handleCancel = () => {
    if (isEditing) {
      setActiveTab('list');
    } else {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {isEditing ? 'Edit Zone' : 'Zone Management'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Edit zone information' : 'Manage all zones and add new ones'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">All Zones</TabsTrigger>
              <TabsTrigger value="form">{isEditing ? 'Edit Zone' : 'Add New Zone'}</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Zones</h3>
                <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Zone
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left p-4 font-semibold">Zone Name</th>
                          <th className="text-left p-4 font-semibold">District</th>
                          <th className="text-left p-4 font-semibold">State</th>
                          <th className="text-left p-4 font-semibold">Created</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zones.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Globe className="h-8 w-8 text-muted-foreground/50" />
                                <p>No zones found</p>
                                <p className="text-sm">Add your first zone to get started.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          zones.map((zone) => (
                            <tr key={zone._id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-medium">{zone.zoneName}</td>
                              <td className="p-4">{zone.district?.districtName || 'N/A'}</td>
                              <td className="p-4">{zone.state?.stateName || 'N/A'}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {zone.createdAt ? new Date(zone.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(zone)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setZonesToDelete(zone);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
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
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zoneName">Zone Name</Label>
                  <Input
                    id="zoneName"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder="Enter zone name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
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

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select
                    value={selectedDistrict}
                    onValueChange={setSelectedDistrict}
                    required
                    disabled={!selectedState}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedState ? "Select a district" : "Select a state first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district._id} value={district._id}>
                          {district.districtName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (isEditing ? 'Update Zone' : 'Create Zone')}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the zone
              "{zonesToDelete?.zoneName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
