'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Plus, BookOpen } from "lucide-react";
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
}

interface Chapter {
  _id: string;
  chapterName: string;
  zone: Zone;
  district: District;
  state: State;
  createdAt: string;
}

interface ChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter?: Chapter | null;
  onSuccess: () => void;
}

export function ChapterDialog({ open, onOpenChange, chapter, onSuccess }: ChapterDialogProps) {
  const [chapterName, setChapterName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chaptersToDelete, setChaptersToDelete] = useState<Chapter | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const isEditing = !!chapter;

  useEffect(() => {
    if (open) {
      fetchStates();
      fetchChapters();
      if (chapter) {
        setChapterName(chapter.chapterName || '');
        setSelectedState(chapter.state?._id || '');
        setSelectedDistrict(chapter.district?._id || '');
        setSelectedZone(chapter.zone?._id || '');
        setActiveTab('form');
      } else {
        setChapterName('');
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedZone('');
        setActiveTab('list');
      }
    }
  }, [open, chapter]);

  useEffect(() => {
    if (selectedState) {
      fetchDistrictsByState(selectedState);
    } else {
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchZonesByDistrict(selectedDistrict);
    } else {
      setZones([]);
      setSelectedZone('');
    }
  }, [selectedDistrict]);

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
        const filteredDistricts = data.data.filter((district: District) => district.state._id === stateId);
        setDistricts(filteredDistricts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchZonesByDistrict = async (districtId: string) => {
    try {
      const response = await fetch('/api/admin/zone');
      const data = await response.json();
      if (data.status === 'Success') {
        const filteredZones = data.data.filter((zone: Zone) => zone.district._id === districtId);
        setZones(filteredZones);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/admin/chapter');
      const data = await response.json();
      if (data.status === 'Success') {
        setChapters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim() || !selectedState || !selectedDistrict || !selectedZone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/admin/chapter/${chapter._id}` : '/api/admin/chapter';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterName: chapterName.trim(),
          state: selectedState,
          district: selectedDistrict,
          zone: selectedZone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: isEditing ? "Chapter Updated" : "Chapter Created",
          description: data.message || `Chapter ${isEditing ? 'updated' : 'created'} successfully.`,
        });
        onSuccess();
        if (!isEditing) {
          setChapterName('');
          setSelectedState('');
          setSelectedDistrict('');
          setSelectedZone('');
        }
        setActiveTab('list');
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${isEditing ? 'update' : 'create'} chapter.`,
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
    if (!chaptersToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chapter/${chaptersToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Chapter Deleted",
          description: data.message || "Chapter deleted successfully.",
        });
        onSuccess();
        fetchChapters();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete chapter.",
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
      setChaptersToDelete(null);
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setChapterName(chapter.chapterName || '');
    setSelectedState(chapter.state?._id || '');
    setSelectedDistrict(chapter.district?._id || '');
    setSelectedZone(chapter.zone?._id || '');
    setActiveTab('form');
  };

  const handleAddNew = () => {
    setChapterName('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedZone('');
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
              <BookOpen className="h-5 w-5" />
              {isEditing ? 'Edit Chapter' : 'Chapter Management'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Edit chapter information' : 'Manage all chapters and add new ones'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">All Chapters</TabsTrigger>
              <TabsTrigger value="form">{isEditing ? 'Edit Chapter' : 'Add New Chapter'}</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Chapters</h3>
                <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Chapter
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left p-4 font-semibold">Chapter Name</th>
                          <th className="text-left p-4 font-semibold">Zone</th>
                          <th className="text-left p-4 font-semibold">District</th>
                          <th className="text-left p-4 font-semibold">State</th>
                          <th className="text-left p-4 font-semibold">Created</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chapters.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center p-8 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                                <p>No chapters found</p>
                                <p className="text-sm">Add your first chapter to get started.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          chapters.map((chapter) => (
                            <tr key={chapter._id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-medium">{chapter.chapterName}</td>
                              <td className="p-4">{chapter.zone?.zoneName || 'N/A'}</td>
                              <td className="p-4">{chapter.district?.districtName || 'N/A'}</td>
                              <td className="p-4">{chapter.state?.stateName || 'N/A'}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(chapter)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setChaptersToDelete(chapter);
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
                  <Label htmlFor="chapterName">Chapter Name</Label>
                  <Input
                    id="chapterName"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="Enter chapter name"
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

                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Select 
                    value={selectedZone} 
                    onValueChange={setSelectedZone} 
                    required
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDistrict ? "Select a zone" : "Select a district first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone._id} value={zone._id}>
                          {zone.zoneName}
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
                    {loading ? 'Saving...' : (isEditing ? 'Update Chapter' : 'Create Chapter')}
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
              This action cannot be undone. This will permanently delete the chapter
              "{chaptersToDelete?.chapterName}".
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
