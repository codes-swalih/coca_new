"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield, UserPlus, Search } from 'lucide-react';

interface Role {
  _id: string;
  title: string;
  categories: (string | { _id?: string; title?: string; name?: string;[key: string]: any })[];
  createdAt: string;
  updatedAt: string;
}

interface Admin {
  _id: string;
  username: string;
  role: string | Role;
  createdAt: string;
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Role Dialog States
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    title: '',
    categories: [] as (string | { _id?: string; title?: string; name?: string;[key: string]: any })[]
  });

  // Admin Dialog States
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: '',
    role: ''
  });

  // Available permissions
  const availablePermissions = [
    'user_management',
    'role_management',
    'booking_management',
    'club_management',
    'zone_management',
    'member_management',
    'event_management',
    'financial_reports',
    'system_settings'
  ];

  // Fetch roles and admins
  const fetchData = async () => {
    try {
      console.log('Fetching roles...');
      // Fetch roles
      const rolesResponse = await fetch('/api/admin/admin/roles');
      console.log('Roles response status:', rolesResponse.status);

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        console.log('Roles data received:', rolesData);
        console.log('Raw roles data structure:', JSON.stringify(rolesData, null, 2));

        // Ensure the data is properly structured
        if (rolesData.data && Array.isArray(rolesData.data)) {
          // Log each role to see its structure
          rolesData.data.forEach((role: any, index: number) => {
            console.log(`Role ${index}:`, role);
            console.log(`Role ${index} categories:`, role.categories);
            console.log(`Role ${index} categories type:`, typeof role.categories);
            if (Array.isArray(role.categories)) {
              role.categories.forEach((cat: any, catIndex: number) => {
                console.log(`  Category ${catIndex}:`, cat);
                console.log(`  Category ${catIndex} type:`, typeof cat);
              });
            }
          });

          // Filter out any malformed role objects
          const validRoles = (rolesData.data as any[]).filter((role: any) =>
            role && typeof role === 'object' && role._id
          );
          console.log('Valid roles after filtering:', validRoles);
          setRoles(validRoles);
        } else {
          console.log('No valid roles data, setting empty array');
          setRoles([]);
        }
      } else {
        console.error('Roles response not ok:', rolesResponse.status, rolesResponse.statusText);
      }

      console.log('Fetching admins...');
      // Fetch admins
      const adminsResponse = await fetch('/api/admin/admin/admins');
      console.log('Admins response status:', adminsResponse.status);

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        console.log('Admins data received:', adminsData);

        // Ensure the data is properly structured
        if (adminsData.data && Array.isArray(adminsData.data)) {
          // Filter out any malformed admin objects
          const validAdmins = (adminsData.data as any[]).filter((admin: any) =>
            admin && typeof admin === 'object' && admin._id
          );
          console.log('Valid admins after filtering:', validAdmins);
          setAdmins(validAdmins);
        } else {
          console.log('No valid admins data, setting empty array');
          setAdmins([]);
        }
      } else {
        console.error('Admins response not ok:', adminsResponse.status, adminsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter roles based on search
  const filteredRoles = roles.filter((role) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      role.title?.toLowerCase().includes(query) ||
      (role.categories && Array.isArray(role.categories) &&
        role.categories.some(category => {
          if (typeof category === 'string') {
            return category.toLowerCase().includes(query);
          } else if (category && typeof category === 'object') {
            return (category.title?.toLowerCase().includes(query) ||
              category.name?.toLowerCase().includes(query));
          }
          return false;
        }))
    );
  });

  // Debug logging
  console.log('Current roles state:', roles);
  console.log('Filtered roles:', filteredRoles);

  // Role Management Functions
  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/admin/admin/createRole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Role created successfully",
        });
        setRoleDialogOpen(false);
        resetRoleForm();
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create role",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const response = await fetch(`/api/admin/admin/roles/${editingRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
        setRoleDialogOpen(false);
        setEditingRole(null);
        resetRoleForm();
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update role",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/admin/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete role",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive"
      });
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      title: role.title,
      categories: role.categories
    });
    setRoleDialogOpen(true);
  };

  const resetRoleForm = () => {
    setRoleForm({
      title: '',
      categories: []
    });
  };

  // Admin Management Functions
  const handleCreateAdmin = async () => {
    // Validate form
    if (!adminForm.username.trim() || !adminForm.password.trim() || !adminForm.role) {
      toast({
        title: "Error",
        description: "Username, password, and role are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/admin/createAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: adminForm.username.trim(),
          password: adminForm.password,
          role: adminForm.role
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin created successfully",
        });
        setAdminDialogOpen(false);
        setAdminForm({
          username: '',
          password: '',
          role: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create admin",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: "Failed to create admin",
        variant: "destructive"
      });
    }
  };



  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      const response = await fetch(`/api/admin/admin/admins/${adminId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin deleted successfully",
        });
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete admin",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete admin",
        variant: "destructive"
      });
    }
  };

  const handleEditAdminClick = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminForm({
      username: admin.username,
      password: '',
      role: admin.role && typeof admin.role === 'object' ? (admin.role as Role)._id : (admin.role as string) || ''
    });
    setAdminDialogOpen(true);
  };

  const handleEditAdmin = async () => {
    if (!editingAdmin) return;

    // Validate form
    if (!adminForm.username.trim() || !adminForm.role) {
      toast({
        title: "Error",
        description: "Username and role are required",
        variant: "destructive"
      });
      return;
    }

    try {
      // Only send password if it's been changed
      const updateData = {
        username: adminForm.username.trim(),
        role: adminForm.role,
        ...(adminForm.password && adminForm.password.trim() !== '' && { password: adminForm.password })
      };

      const response = await fetch(`/api/admin/admin/admins/${editingAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin updated successfully",
        });
        setAdminDialogOpen(false);
        setEditingAdmin(null);
        resetAdminForm();
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update admin",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: "Error",
        description: "Failed to update admin",
        variant: "destructive"
      });
    }
  };

  const resetAdminForm = () => {
    setAdminForm({
      username: '',
      password: '',
      role: ''
    });
    setEditingAdmin(null);
  };

  const toggleCategory = (category: string) => {
    setRoleForm(prev => ({
      ...prev,
      categories: prev.categories.some(c =>
        typeof c === 'string' ? c === category : (c?.title === category || c?.name === category)
      )
        ? prev.categories.filter(c =>
          typeof c === 'string' ? c !== category : (c?.title !== category && c?.name !== category)
        )
        : [...prev.categories, category]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions, create admin accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setRoleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
          <Button onClick={() => {
            setAdminDialogOpen(true);
            resetAdminForm();
          }} variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Create Admin
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roles by title or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {filteredRoles.length} of {roles.length} roles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              All Roles ({filteredRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">Title</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Categories</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        {searchQuery ? 'No roles match your search' : 'No roles found'}
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role, index) => (
                      <tr key={role._id || `role-${index}`} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{role.title || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              console.log('Rendering categories for role:', role.title);
                              console.log('Categories:', role.categories);
                              console.log('Categories type:', typeof role.categories);
                              console.log('Is array:', Array.isArray(role.categories));

                              if (role.categories && Array.isArray(role.categories)) {
                                return role.categories.map((category, catIndex) => {
                                  console.log(`Category ${catIndex}:`, category);
                                  console.log(`Category ${catIndex} type:`, typeof category);

                                  // Handle both string and object categories
                                  let categoryText = 'Unknown';
                                  let categoryKey = `cat-${catIndex}`;

                                  if (typeof category === 'string') {
                                    categoryText = category;
                                    categoryKey = category;
                                  } else if (category && typeof category === 'object') {
                                    categoryText = category.title || category.name || 'Unknown';
                                    categoryKey = category._id || `cat-${catIndex}`;
                                  }

                                  console.log(`Final categoryText: "${categoryText}"`);
                                  console.log(`Final categoryKey: "${categoryKey}"`);

                                  return (
                                    <Badge key={categoryKey} variant="secondary" className="text-xs">
                                      {typeof categoryText === 'string' ?
                                        categoryText.split('_').map((word: string) =>
                                          word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ') :
                                        'Unknown'
                                      }
                                    </Badge>
                                  );
                                });
                              } else {
                                return <span className="text-muted-foreground text-sm">No categories</span>;
                              }
                            })()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleEditRole(role)}
                              className="h-7 w-7"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDeleteRole(role._id)}
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

        {/* Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              All Admins ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">Username</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin, index) => (
                      <tr key={admin._id || `admin-${index}`} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{admin.username || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {admin.role && typeof admin.role === 'object' ? (admin.role as Role).title : (admin.role as string) || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleEditAdminClick(admin)}
                              className="h-7 w-7"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDeleteAdmin(admin._id)}
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
      </div>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? 'Modify role details and permissions' : 'Create a new role with specific permissions'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={roleForm.title}
                onChange={(e) => setRoleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter role title"
              />
            </div>

            <div>
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                {availablePermissions.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={category}
                      checked={roleForm.categories.some(c =>
                        typeof c === 'string' ? c === category : (c?.title === category || c?.name === category)
                      )}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={category} className="text-sm">
                      {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setRoleDialogOpen(false);
              setEditingRole(null);
              resetRoleForm();
            }}>
              Cancel
            </Button>
            <Button onClick={editingRole ? handleUpdateRole : handleCreateRole}>
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin ? 'Modify admin account details' : 'Create a new admin account with username, password, and role'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={adminForm.username}
                onChange={(e) => setAdminForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
              />
            </div>

            <div>
              <Label htmlFor="password">
                {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder={editingAdmin ? 'Enter new password or leave blank' : 'Enter password'}
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={adminForm.role} onValueChange={(value) => setAdminForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      {role.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setAdminDialogOpen(false);
              resetAdminForm();
            }}>
              Cancel
            </Button>
            <Button onClick={editingAdmin ? handleEditAdmin : handleCreateAdmin}>
              {editingAdmin ? 'Update Admin' : 'Create Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
