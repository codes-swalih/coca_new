"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Calendar, MapPin, User, Phone, Mail, Clock, CreditCard, Building, Search } from 'lucide-react';

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
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
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

             {/* Search Bar */}
       <Card>
         <CardContent className="pt-6">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <input
               type="text"
               placeholder="Search bookings by ID, client name, venue, function type, status..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
             />
           </div>
           {searchQuery && (
             <div className="mt-2 text-sm text-muted-foreground">
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
                   <th className="p-4 text-left font-medium text-muted-foreground">Booking Details</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Client Information</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Event Details</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Dates</th>
                   <th className="p-4 text-left font-medium text-muted-foreground">Financial</th>
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
                      {/* Booking Details */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            Booking #{booking.bookingId}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {booking._id.slice(-8)}
                          </div>
                        </div>
                      </td>

                      {/* Client Information */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {booking.clientName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.emailId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.mobileNumber}
                          </div>
                        </div>
                      </td>

                      {/* Event Details */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {booking.typeOfFunction}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.venue}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.customerRelation}
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {booking.startingDate}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            to {booking.endingDate}
                          </div>
                        </div>
                      </td>

                      {/* Financial */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            Total: ₹{booking.totalBudget}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Advance: ₹{booking.advanceAmount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Balance: ₹{booking.balanceAmount}
                          </div>
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
                          size="sm"
                          onClick={() => handleDetailedView(booking)}
                          className="h-8 w-8 p-0"
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
