'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Plus, Building2 } from "lucide-react";
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
  createdAt: string;
}

interface DistrictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  district?: District | null;
  onSuccess: () => void;
}

export function DistrictDialog({ open, onOpenChange, district, onSuccess }: DistrictDialogProps) {
  const [districtName, setDistrictName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [districtsToDelete, setDistrictsToDelete] = useState<District | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const isEditing = !!district;

  useEffect(() => {
    if (open) {
      fetchStates();
      fetchDistricts();
      if (district) {
        setDistrictName(district.districtName || '');
        setSelectedState(district.state?._id || '');
        setActiveTab('form');
      } else {
        setDistrictName('');
        setSelectedState('');
        setActiveTab('list');
      }
    }
  }, [open, district]);

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

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/admin/district');
      const data = await response.json();
      if (data.status === 'Success') {
        setDistricts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtName.trim() || !selectedState) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/admin/district/${district._id}` : '/api/admin/district';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          districtName: districtName.trim(),
          state: selectedState,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: isEditing ? "District Updated" : "District Created",
          description: data.message || `District ${isEditing ? 'updated' : 'created'} successfully.`,
        });
        onSuccess();
        if (!isEditing) {
          setDistrictName('');
          setSelectedState('');
        }
        setActiveTab('list');
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${isEditing ? 'update' : 'create'} district.`,
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
    if (!districtsToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/district/${districtsToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "District Deleted",
          description: data.message || "District deleted successfully.",
        });
        onSuccess();
        fetchDistricts();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete district.",
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
      setDistrictsToDelete(null);
    }
  };

  const handleEdit = (district: District) => {
    setDistrictName(district.districtName || '');
    setSelectedState(district.state?._id || '');
    setActiveTab('form');
  };

  const handleAddNew = () => {
    setDistrictName('');
    setSelectedState('');
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
              <Building2 className="h-5 w-5" />
              {isEditing ? 'Edit District' : 'District Management'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Edit district information' : 'Manage all districts and add new ones'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">All Districts</TabsTrigger>
              <TabsTrigger value="form">{isEditing ? 'Edit District' : 'Add New District'}</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Districts</h3>
                <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New District
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left p-4 font-semibold">District Name</th>
                          <th className="text-left p-4 font-semibold">State</th>
                          <th className="text-left p-4 font-semibold">Created</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {districts.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center p-8 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Building2 className="h-8 w-8 text-muted-foreground/50" />
                                <p>No districts found</p>
                                <p className="text-sm">Add your first district to get started.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          districts.map((district) => (
                            <tr key={district._id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-medium">{district.districtName}</td>
                              <td className="p-4">{district.state?.stateName || 'N/A'}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {district.createdAt ? new Date(district.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(district)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setDistrictsToDelete(district);
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
                  <Label htmlFor="districtName">District Name</Label>
                  <Input
                    id="districtName"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    placeholder="Enter district name"
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

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (isEditing ? 'Update District' : 'Create District')}
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
              This action cannot be undone. This will permanently delete the district
              "{districtsToDelete?.districtName}".
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
