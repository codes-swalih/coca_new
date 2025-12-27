"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare, Search, Filter, X, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { exportToCSV } from "@/lib/export-utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface Enquiry {
  _id: string;
  status: string;
  name: string;
  phone: string;
  secondaryPhone: string;
  relation: string;
  date: string;
  location: string;
  email: string;
  category: string;
  memberId: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const response = await fetch("/api/admin/enquiries");
      const data = await response.json();
      if (data.status === "Success") {
        setEnquiries(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueStatuses = Array.from(
    new Set(enquiries.map((e) => e.status).filter(Boolean))
  );
  const uniqueCategories = Array.from(
    new Set(enquiries.map((e) => e.category).filter(Boolean))
  );
  const uniqueLocations = Array.from(
    new Set(enquiries.map((e) => e.location).filter(Boolean))
  );

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setLocationFilter("all");
    setDateRange(undefined);
    setSearchQuery("");
  };

  // Check if any filters are active
  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    locationFilter !== "all" ||
    dateRange !== undefined ||
    searchQuery;

  const filteredEnquiries = enquiries.filter((enquiry) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        enquiry.name?.toLowerCase().includes(query) ||
        enquiry.email?.toLowerCase().includes(query) ||
        enquiry.phone?.includes(query) ||
        enquiry.category?.toLowerCase().includes(query) ||
        enquiry.location?.toLowerCase().includes(query) ||
        enquiry.status?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all" && enquiry.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all" && enquiry.category !== categoryFilter) {
      return false;
    }

    // Location filter
    if (locationFilter !== "all" && enquiry.location !== locationFilter) {
      return false;
    }

    // Date range filter
    if (dateRange?.from || dateRange?.to) {
      const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      };

      const enquiryDate = parseDate(enquiry.date);
      if (!enquiryDate) return false;

      const filterStart = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
      const filterEnd = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;

      if (filterStart && enquiryDate < filterStart) return false;
      if (filterEnd && enquiryDate > filterEnd) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "pending") {
      return <Badge variant="secondary">{status}</Badge>;
    } else if (statusLower === "completed" || statusLower === "resolved") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      );
    } else if (statusLower === "cancelled" || statusLower === "rejected") {
      return <Badge variant="destructive">{status}</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  // Export enquiries to CSV
  const handleExportEnquiries = () => {
    const columns = [
      { header: "Name", accessor: "name" as const },
      { header: "Email", accessor: "email" as const },
      { header: "Phone", accessor: "phone" as const },
      { header: "Category", accessor: "category" as const },
      { header: "Location", accessor: "location" as const },
      { header: "Date", accessor: "date" as const },
      { header: "Status", accessor: "status" as const },
    ];

    const filename = `enquiries_export_${new Date().toISOString().split("T")[0]}`;
    exportToCSV(filteredEnquiries, columns, filename);
  };

  if (loading) {
    return (
      <RouteGuard requiredPermission="booking_management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">
              Loading enquiries...
            </p>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermission="booking_management">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Enquiries Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all customer enquiries
            </p>
          </div>
          <Button
            onClick={handleExportEnquiries}
            disabled={filteredEnquiries.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Enquiries
          </Button>
        </div>

        {/* Search Bar and Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search enquiries by name, email, phone, category, location, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && !showFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    !
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {uniqueStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="category-filter">Category</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger id="category-filter">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="location-filter">Location</Label>
                    <Select
                      value={locationFilter}
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger id="location-filter">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {(searchQuery || hasActiveFilters) && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredEnquiries.length} of {enquiries.length} enquiries
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enquiries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              All Enquiries ({filteredEnquiries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Phone
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Location
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-lg font-medium">
                            {searchQuery || hasActiveFilters
                              ? "No enquiries match your filters"
                              : "No enquiries found"}
                          </p>
                          <p className="text-sm">
                            {searchQuery || hasActiveFilters
                              ? "Try adjusting your filters."
                              : "Enquiries will appear here."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEnquiries.map((enquiry) => (
                      <tr
                        key={enquiry._id}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="p-4 font-medium">{enquiry.name}</td>
                        <td className="p-4">{enquiry.email}</td>
                        <td className="p-4">{enquiry.phone}</td>
                        <td className="p-4">{enquiry.category}</td>
                        <td className="p-4">{enquiry.location}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {enquiry.date}
                        </td>
                        <td className="p-4">{getStatusBadge(enquiry.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}
