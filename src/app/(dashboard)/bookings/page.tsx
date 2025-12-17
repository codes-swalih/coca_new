"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Calendar, MapPin, User, Phone, Mail, Clock, CreditCard, Building, Search, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface Booking {
  _id: string;
  bookingId: string;
  clientName: string;
  startingDate: string;
  endingDate: string;
  mobileNumber: string;
  emailId: string;
  venue: string;
  typeOfFunction: string;
  customerRelation: string;
  associatedProgram: Array<{
    _id: string;
    members: Array<{
      _id: string;
      memberName: string;
      service: string;
    }>;
    startDate: string;
    endDate: string;
    timeSlot: string;
    budget: string;
  }>;
  totalBudget: string;
  advanceAmount: string;
  workStatus: string;
  balanceAmount: string;
  memberId: string;
  __v: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailedViewOpen, setDetailedViewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [functionTypeFilter, setFunctionTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [minBudgetFilter, setMinBudgetFilter] = useState<string>('');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<string>('');

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/user_routes/bookings');
      const data = await response.json();
      
      if (data?.status === "Success") {
        console.log('Bookings data received:', data.data);
        setBookings(data.data || []);
      } else {
        console.error('Failed to fetch bookings:', data.message);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDetailedView = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailedViewOpen(true);
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-50 text-gray-600 border border-gray-200';
    
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'ongoing':
        return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      case 'completed':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'confirmed':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(bookings.map(b => b.workStatus).filter(Boolean)));
  const uniqueFunctionTypes = Array.from(new Set(bookings.map(b => b.typeOfFunction).filter(Boolean)));

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setFunctionTypeFilter('all');
    setDateRange(undefined);
    setMinBudgetFilter('');
    setMaxBudgetFilter('');
    setSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters = 
    statusFilter !== 'all' || 
    functionTypeFilter !== 'all' || 
    dateRange?.from || 
    dateRange?.to || 
    minBudgetFilter || 
    maxBudgetFilter || 
    searchQuery;

  // Filter bookings based on search query and filters
  const filteredBookings = bookings.filter((booking) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        booking.bookingId.toLowerCase().includes(query) ||
        booking.clientName.toLowerCase().includes(query) ||
        booking.emailId.toLowerCase().includes(query) ||
        booking.mobileNumber.includes(query) ||
        booking.venue.toLowerCase().includes(query) ||
        booking.typeOfFunction.toLowerCase().includes(query) ||
        booking.customerRelation.toLowerCase().includes(query) ||
        booking.totalBudget.includes(query) ||
        booking.workStatus.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && booking.workStatus !== statusFilter) {
      return false;
    }

    // Function type filter
    if (functionTypeFilter !== 'all' && booking.typeOfFunction !== functionTypeFilter) {
      return false;
    }

    // Date range filter
    if (dateRange?.from || dateRange?.to) {
      // Parse DD-MM-YYYY format to Date
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date;
      };

      const bookingStart = parseDate(booking.startingDate);
      const bookingEnd = parseDate(booking.endingDate);
      const filterStart = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
      const filterEnd = dateRange.to ? new Date(dateRange.to.setHours(0, 0, 0, 0)) : null;

      // Check overlap: booking must start before/on filter end AND end after/on filter start
      if (filterStart && filterEnd) {
        if (bookingStart > filterEnd || bookingEnd < filterStart) return false;
      } else if (filterStart && bookingEnd < filterStart) {
        return false;
      } else if (filterEnd && bookingStart > filterEnd) {
        return false;
      }
    }

    // Budget range filter
    if (minBudgetFilter) {
      const budget = parseFloat(booking.totalBudget.replace(/,/g, ''));
      const minBudget = parseFloat(minBudgetFilter);
      if (budget < minBudget) return false;
    }

    if (maxBudgetFilter) {
      const budget = parseFloat(booking.totalBudget.replace(/,/g, ''));
      const maxBudget = parseFloat(maxBudgetFilter);
      if (budget > maxBudget) return false;
    }

    return true;
  });





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
          <p className="text-muted-foreground">
            View and manage all service bookings
          </p>
        </div>
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
                placeholder="Search bookings by ID, client name, venue, function type, status..."
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
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {/* Function Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="function-filter">Function Type</Label>
                  <Select value={functionTypeFilter} onValueChange={setFunctionTypeFilter}>
                    <SelectTrigger id="function-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueFunctionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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

                {/* Min Budget Filter */}
                <div className="space-y-2">
                  <Label htmlFor="min-budget-filter">Min Budget (₹)</Label>
                  <Input
                    id="min-budget-filter"
                    type="number"
                    placeholder="0"
                    value={minBudgetFilter}
                    onChange={(e) => setMinBudgetFilter(e.target.value)}
                  />
                </div>

                {/* Max Budget Filter */}
                <div className="space-y-2">
                  <Label htmlFor="max-budget-filter">Max Budget (₹)</Label>
                  <Input
                    id="max-budget-filter"
                    type="number"
                    placeholder="No limit"
                    value={maxBudgetFilter}
                    onChange={(e) => setMaxBudgetFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {(searchQuery || hasActiveFilters) && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          )}
        </CardContent>
      </Card>

       {/* Bookings Table */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Calendar className="h-5 w-5" />
             All Bookings ({filteredBookings.length})
           </CardTitle>
         </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                                 <tr className="border-b border-border/50">
                   <th className="p-4 text-left font-medium text-muted-foreground">Booking</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Client</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Event</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                 </tr>
              </thead>
              <tbody>
                                 {filteredBookings.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="p-8 text-center text-muted-foreground">
                       {searchQuery ? 'No bookings match your search' : 'No bookings found'}
                     </td>
                   </tr>
                 ) : (
                   filteredBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-border/50 hover:bg-muted/30">
                      {/* Booking */}
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          #{booking.bookingId}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="p-4">
                        <div className="text-foreground">
                          {booking.clientName}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {booking.venue}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.typeOfFunction}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div className="text-foreground">
                          {booking.startingDate}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          ₹{booking.totalBudget}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <Badge className={getStatusColor(booking.workStatus)}>
                          {booking.workStatus || 'Unknown'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleDetailedView(booking)}
                          className="h-7 w-7"
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Detailed View Dialog */}
      {selectedBooking && (
        <Dialog open={detailedViewOpen} onOpenChange={setDetailedViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Details: #{selectedBooking.bookingId}
                </DialogTitle>
              <DialogDescription>
                Complete information about this booking
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Booking ID:</span>
                    <div className="font-mono text-sm mt-1">{selectedBooking.bookingId}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Total Budget:</span>
                    <div className="font-semibold text-lg mt-1 text-primary">
                      ₹{selectedBooking.totalBudget}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Starting Date:</span>
                    <div className="mt-1">{selectedBooking.startingDate}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Ending Date:</span>
                    <div className="mt-1">{selectedBooking.endingDate}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Status Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Work Status:</span>
                    <div className="mt-2">
                      <Badge className={getStatusColor(selectedBooking.workStatus)}>
                        {selectedBooking.workStatus || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Member ID:</span>
                    <div className="mt-1 font-mono text-sm">{selectedBooking.memberId}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Name:</span>
                    <div className="mt-1">{selectedBooking.clientName}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <div className="mt-1">{selectedBooking.emailId}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Phone:</span>
                    <div className="mt-1">{selectedBooking.mobileNumber}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Customer Relation:</span>
                    <div className="mt-1">{selectedBooking.customerRelation}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Event Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Event Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Type of Function:</span>
                    <div className="mt-1">{selectedBooking.typeOfFunction}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Venue:</span>
                    <div className="mt-1">{selectedBooking.venue}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Starting Date:</span>
                    <div className="mt-1">{selectedBooking.startingDate}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Ending Date:</span>
                    <div className="mt-1">{selectedBooking.endingDate}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Total Budget:</span>
                    <div className="font-semibold text-lg mt-1 text-primary">₹{selectedBooking.totalBudget}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Advance Amount:</span>
                    <div className="font-semibold text-lg mt-1 text-green-600">₹{selectedBooking.advanceAmount}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-muted-foreground">Balance Amount:</span>
                    <div className="font-semibold text-lg mt-1 text-orange-600">₹{selectedBooking.balanceAmount}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Associated Programs */}
              {selectedBooking.associatedProgram && selectedBooking.associatedProgram.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Associated Programs ({selectedBooking.associatedProgram.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedBooking.associatedProgram.map((program, index) => (
                      <div key={program._id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-muted-foreground">Program {index + 1}:</span>
                            <div className="mt-1 space-y-2">
                              <div className="text-sm">
                                <span className="font-medium">Dates:</span> {program.startDate} - {program.endDate}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Time Slot:</span> {program.timeSlot}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Budget:</span> ₹{program.budget}
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Members:</span>
                            <div className="mt-1 space-y-1">
                              {program.members.map((member, memberIndex) => (
                                <div key={member._id} className="text-sm bg-muted/50 p-2 rounded">
                                  <span className="font-medium">{member.memberName}</span> - {member.service}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Associated Programs
                  </h3>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
                    <span className="text-muted-foreground">No associated programs for this booking</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
