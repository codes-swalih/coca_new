'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Building2, BookOpen, Plus, Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { StateDialog } from "@/components/zone-management/state-dialog";
import { DistrictDialog } from "@/components/zone-management/district-dialog";
import { ZoneDialog } from "@/components/zone-management/zone-dialog";
import { ChapterDialog } from "@/components/zone-management/chapter-dialog";
import { RouteGuard } from "@/components/auth/RouteGuard";

interface Counts {
  states: number;
  zones: number;
  districts: number;
  chapters: number;
}

interface State {
  _id: string;
  stateName: string;
  createdAt: string;
  updatedAt: string;
}

interface District {
  _id: string;
  districtName: string;
  state: State;
  createdAt: string;
  updatedAt: string;
}

interface Zone {
  _id: string;
  zoneName: string;
  district: District;
  state: State;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  _id: string;
  chapterName: string;
  zone: Zone;
  district: District;
  state: State;
  createdAt: string;
  updatedAt: string;
}

export default function ZoneManagementPage() {
  const [counts, setCounts] = useState<Counts>({
    states: 0,
    zones: 0,
    districts: 0,
    chapters: 0,
  });
  const [loading, setLoading] = useState(true);

  // Data states for actual entities
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Dialog states
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [districtDialogOpen, setDistrictDialogOpen] = useState(false);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);

  // Edit states
  const [editingState, setEditingState] = useState<any>(null);
  const [editingDistrict, setEditingDistrict] = useState<any>(null);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editingChapter, setEditingChapter] = useState<any>(null);

  // Search state
  const [chapterSearch, setChapterSearch] = useState('');

  // Filtered chapters
  const filteredChapters = chapters.filter((chapter) =>
    chapter.chapterName?.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    chapter.zone?.zoneName?.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    chapter.district?.districtName?.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    chapter.state?.stateName?.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  // Handler functions for Add buttons
  const handleAddState = () => {
    setEditingState(null);
    setStateDialogOpen(true);
  };

  const handleAddZone = () => {
    setEditingZone(null);
    setZoneDialogOpen(true);
  };

  const handleAddDistrict = () => {
    setEditingDistrict(null);
    setDistrictDialogOpen(true);
  };

  const handleAddChapter = () => {
    setEditingChapter(null);
    setChapterDialogOpen(true);
  };

  // Handler functions for Edit buttons
  const handleEditState = (state: any) => {
    setEditingState(state);
    setStateDialogOpen(true);
  };

  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    setZoneDialogOpen(true);
  };

  const handleEditDistrict = (district: any) => {
    setEditingDistrict(district);
    setDistrictDialogOpen(true);
  };

  const handleEditChapter = (chapter: any) => {
    setEditingChapter(chapter);
    setChapterDialogOpen(true);
  };

  // Success callback to refresh data
  const handleSuccess = () => {
    fetchCounts();
  };

  const fetchCounts = async () => {
    try {
      // Fetch counts from API endpoints
      const [statesRes, zonesRes, districtsRes, chaptersRes] = await Promise.all([
        fetch('/api/admin/state'),
        fetch('/api/admin/zone'),
        fetch('/api/admin/district'),
        fetch('/api/admin/chapter'),
      ]);

      const statesData = await statesRes.json();
      const zonesData = await zonesRes.json();
      const districtsData = await districtsRes.json();
      const chaptersData = await chaptersRes.json();

      // Check if responses are successful and set both counts and data
      if (statesData.status === "Success") {
        setCounts(prev => ({ ...prev, states: statesData.data?.length || 0 }));
        setStates(statesData.data || []);
      }
      
      if (zonesData.status === "Success") {
        setCounts(prev => ({ ...prev, zones: zonesData.data?.length || 0 }));
        setZones(zonesData.data || []);
      }
      
      if (districtsData.status === "Success") {
        setCounts(prev => ({ ...prev, districts: districtsData.data?.length || 0 }));
        setDistricts(districtsData.data || []);
      }
      
      if (chaptersData.status === "Success") {
        setCounts(prev => ({ ...prev, chapters: chaptersData.data?.length || 0 }));
        setChapters(chaptersData.data || []);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <RouteGuard requiredPermission="zone_management">
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Zone Management</h1>
              <p className="text-lg text-muted-foreground mt-1">Manage your geographical hierarchy and administrative divisions</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
                  <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-20 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4"></div>
                  <div className="h-9 w-full bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermission="zone_management">
    <div className="p-8 space-y-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Zone Management</h1>
          <p className="text-lg text-muted-foreground mt-1">Manage your geographical hierarchy and administrative divisions</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
          onClick={handleAddState}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground group-hover:text-foreground">Total States</CardTitle>
            <MapPin className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground group-hover:text-foreground mb-1">{counts.states}</div>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground mb-4">Geographical regions</p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddState();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add State
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
          onClick={handleAddZone}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground group-hover:text-foreground">Total Zones</CardTitle>
            <Globe className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground group-hover:text-foreground mb-1">{counts.zones}</div>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground mb-4">Administrative zones</p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddZone();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
          onClick={handleAddDistrict}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground group-hover:text-foreground">Total Districts</CardTitle>
            <Building2 className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground group-hover:text-foreground mb-1">{counts.districts}</div>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground mb-4">Local districts</p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddDistrict();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add District
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/30 hover:bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground group-hover:text-foreground">Total Chapters</CardTitle>
            <BookOpen className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground group-hover:text-foreground mb-1">{counts.chapters}</div>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground mb-4">Local chapters</p>
            <div className="flex gap-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" size="sm" onClick={handleAddChapter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Chapters Table */}
      <Card className="shadow-sm border-2">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              All Chapters
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chapters..."
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 shadow-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left p-4 font-semibold text-foreground">Chapter Name</th>
                  <th className="text-left p-4 font-semibold text-foreground">Zone</th>
                  <th className="text-left p-4 font-semibold text-foreground">District</th>
                  <th className="text-left p-4 font-semibold text-foreground">State</th>
                  <th className="text-left p-4 font-semibold text-foreground">Created</th>
                  <th className="text-left p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-medium">{chapterSearch ? 'No chapters match your search' : 'No chapters found'}</p>
                        <p className="text-sm">{chapterSearch ? 'Try a different search term.' : 'Add your first chapter above to get started.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredChapters.map((chapter) => (
                    <tr key={chapter._id} className="border-b hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-200 group">
                      <td className="p-4 font-semibold text-foreground group-hover:text-foreground">
                        {chapter.chapterName || 'N/A'}
                      </td>
                      <td className="p-4 text-foreground/80 group-hover:text-foreground/90">{chapter.zone?.zoneName || 'N/A'}</td>
                      <td className="p-4 text-foreground/80 group-hover:text-foreground/90">{chapter.district?.districtName || 'N/A'}</td>
                      <td className="p-4 text-foreground/80 group-hover:text-foreground/90">{chapter.state?.stateName || 'N/A'}</td>
                      <td className="p-4 text-sm text-muted-foreground group-hover:text-muted-foreground">
                        {chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 hover:border-primary hover:bg-primary hover:text-primary-foreground dark:border-slate-700 dark:hover:border-primary dark:hover:bg-primary shadow-sm transition-all duration-200"
                          onClick={() => handleEditChapter(chapter)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
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
      <StateDialog
        open={stateDialogOpen}
        onOpenChange={setStateDialogOpen}
        state={editingState}
        onSuccess={handleSuccess}
      />
      <DistrictDialog
        open={districtDialogOpen}
        onOpenChange={setDistrictDialogOpen}
        district={editingDistrict}
        onSuccess={handleSuccess}
      />
      <ZoneDialog
        open={zoneDialogOpen}
        onOpenChange={setZoneDialogOpen}
        zone={editingZone}
        onSuccess={handleSuccess}
      />
      <ChapterDialog
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
        chapter={editingChapter}
        onSuccess={handleSuccess}
      />
    </div>
    </RouteGuard>
  );
}