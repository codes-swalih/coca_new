'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Plus } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

interface State {
  _id: string;
  stateName: string;
  createdAt: string;
  updatedAt: string;
}

interface StateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state?: State | null;
  onSuccess: () => void;
}

export function StateDialog({ open, onOpenChange, state, onSuccess }: StateDialogProps) {
  const [stateName, setStateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const [editingState, setEditingState] = useState<State | null>(null);

  const isEdit = !!editingState;

  useEffect(() => {
    if (open) {
      fetchStates();
      setActiveTab('list');
      setEditingState(null);
      setStateName('');
    }
  }, [open]);

  useEffect(() => {
    if (editingState) {
      setStateName(editingState.stateName);
    } else {
      setStateName('');
    }
  }, [editingState]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a state name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/state/${editingState?._id}` : '/api/admin/state';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stateName: stateName.trim() }),
      });

      const data = await response.json();

      if (data.status === 'Success') {
        toast({
          title: "Success",
          description: data.message,
        });
        onSuccess();
        fetchStates();
        setEditingState(null);
        setStateName('');
        setActiveTab('list');
      } else {
        toast({
          title: "Error",
          description: data.message || 'Something went wrong',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (state: State) => {
    setEditingState(state);
    setActiveTab('form');
  };

  const handleAddNew = () => {
    setEditingState(null);
    setStateName('');
    setActiveTab('form');
  };

  const handleDelete = async () => {
    if (!editingState) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/state/${editingState._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'Success') {
        toast({
          title: "Success",
          description: data.message,
        });
        onSuccess();
        fetchStates();
        setEditingState(null);
        setStateName('');
        setActiveTab('list');
        setDeleteDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.message || 'Something went wrong',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingState(null);
    setStateName('');
    setActiveTab('list');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>State Management</DialogTitle>
            <DialogDescription>
              Manage all states - view, add, edit, and delete states.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">All States</TabsTrigger>
              <TabsTrigger value="form">{isEdit ? 'Edit State' : 'Add New State'}</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>States List</CardTitle>
                  <Button onClick={handleAddNew} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New State
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">State Name</th>
                          <th className="text-left p-3 font-medium">Created</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {states.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center p-8 text-muted-foreground">
                              No states found. Add your first state.
                            </td>
                          </tr>
                        ) : (
                          states.map((state) => (
                            <tr key={state._id} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium">{state.stateName}</td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {new Date(state.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(state)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingState(state);
                                      setDeleteDialogOpen(true);
                                    }}
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

            <TabsContent value="form" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{isEdit ? 'Edit State' : 'Add New State'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stateName" className="text-right">
                          State Name
                        </Label>
                        <Input
                          id="stateName"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="col-span-3"
                          placeholder="Enter state name"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the state "{editingState?.stateName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
