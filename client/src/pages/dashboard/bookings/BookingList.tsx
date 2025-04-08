import React, { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const BookingList: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Get URL params
  const params = new URLSearchParams(window.location.search);
  const defaultTab = params.get('filter') || 'upcoming';
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // Fetch bookings based on role and active tab
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/bookings', user?.role, activeTab],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/bookings?status=${activeTab}&role=${user?.role}`, null);
      return res.json();
    },
  });

  // Mutation for cancelling a booking
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest('POST', `/api/bookings/${bookingId}/cancel`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setShowCancelDialog(false);
      toast({
        title: "Booking cancelled",
        description: "The booking has been cancelled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel booking",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation for submitting a review
  const submitReview = useMutation({
    mutationFn: async (data: { bookingId: number; rating: number; comment: string }) => {
      const res = await apiRequest('POST', '/api/reviews', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setShowReviewDialog(false);
      setReviewRating(5);
      setReviewComment('');
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle cancel booking
  const handleCancelBooking = () => {
    if (selectedBooking) {
      cancelBooking.mutate(selectedBooking.id);
    }
  };

  // Handle submit review
  const handleSubmitReview = () => {
    if (selectedBooking) {
      submitReview.mutate({
        bookingId: selectedBooking.id,
        rating: reviewRating,
        comment: reviewComment,
      });
    }
  };

  // Render status badge based on booking status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <span>Pending</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Accepted</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Completed</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            <span>Cancelled</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>{status}</span>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">My Bookings</h2>
          <p className="text-gray-500">Manage your service bookings and appointments</p>
        </div>
        
        <Card>
          <CardHeader>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-6">
                {renderBookingList('upcoming')}
              </TabsContent>
              
              <TabsContent value="pending" className="mt-6">
                {renderBookingList('pending')}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-6">
                {renderBookingList('completed')}
              </TabsContent>
              
              <TabsContent value="cancelled" className="mt-6">
                {renderBookingList('cancelled')}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedBooking.serviceType}</h4>
                <p className="text-gray-500 text-sm mt-1">{selectedBooking.description}</p>
                <div className="flex items-center mt-2 text-sm">
                  <CalendarDays className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{selectedBooking.scheduledDate}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with the service provider
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedBooking.serviceType}</h4>
                <p className="text-gray-500 text-sm">{selectedBooking.provider?.name}</p>
                <p className="text-gray-500 text-sm mt-1">{selectedBooking.completedDate}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-8 w-8 ${
                            rating <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 p-2 min-h-[100px] focus:border-primary focus:ring-primary focus:outline-none"
                    placeholder="Share details of your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={submitReview.isPending}
            >
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );

  function renderBookingList(status: string) {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
        </div>
      );
    }

    const filteredBookings = bookings?.filter((booking: any) => 
      status === 'upcoming' 
        ? booking.status === 'accepted' 
        : booking.status === status
    ) || [];

    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No {status} bookings found</h3>
          <p className="text-gray-500 mb-4">You don't have any {status} bookings right now.</p>
          {status !== 'cancelled' && status !== 'completed' && (
            <Button>Book a Service</Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredBookings.map((booking: any) => (
          <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-start mb-4">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-lg mr-3">
                      <booking.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-lg mr-2">{booking.serviceType}</h3>
                        {renderStatusBadge(booking.status)}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{booking.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{booking.scheduledDate}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{booking.scheduledTime}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{booking.location}</span>
                    </div>
                  </div>
                  
                  {user?.role === 'customer' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                          <img 
                            src={booking.provider?.avatar || `https://ui-avatars.com/api/?name=${booking.provider?.name}`} 
                            alt="Provider avatar" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{booking.provider?.name}</p>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span className="ml-1 text-xs text-gray-700">{booking.provider?.rating}</span>
                            </div>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-xs text-gray-700">{booking.provider?.jobsCompleted} jobs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'provider' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                          <img 
                            src={booking.customer?.avatar || `https://ui-avatars.com/api/?name=${booking.customer?.name}`} 
                            alt="Customer avatar" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{booking.customer?.name}</p>
                          <p className="text-xs text-gray-500">{booking.customer?.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-6 flex flex-row md:flex-col justify-between items-center md:items-start md:w-64">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-xl font-semibold">₹{booking.price}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 mt-4">
                    {booking.status === 'pending' && (
                      <>
                        <Button size="sm">
                          {user?.role === 'customer' ? 'Modify Request' : 'Accept Booking'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelDialog(true);
                          }}
                        >
                          {user?.role === 'customer' ? 'Cancel Request' : 'Decline'}
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'accepted' && (
                      <>
                        <Button size="sm">
                          {user?.role === 'customer' ? 'View Details' : 'Mark Complete'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelDialog(true);
                          }}
                        >
                          Cancel Booking
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'completed' && user?.role === 'customer' && !booking.hasReview && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReviewDialog(true);
                        }}
                      >
                        Leave Review
                      </Button>
                    )}
                    
                    {booking.status === 'completed' && (
                      <Button variant="outline" size="sm">View Details</Button>
                    )}
                    
                    {booking.status === 'cancelled' && (
                      <Button variant="outline" size="sm">Book Again</Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default BookingList;
