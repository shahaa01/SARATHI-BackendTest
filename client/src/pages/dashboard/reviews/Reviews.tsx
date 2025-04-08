import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Star, MessageSquare, Calendar, CheckCircle, User } from 'lucide-react';

const Reviews: React.FC = () => {
  const { data: user } = useCurrentUser();
  
  // Fetch reviews based on user role
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['/api/reviews', user?.role],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/reviews?role=${user?.role}`, null);
      return res.json();
    },
  });

  // Extract data depending on user role
  const pendingReviews = isLoading ? [] : (reviewsData?.pendingReviews || []);
  const myReviews = isLoading ? [] : (reviewsData?.myReviews || []);
  
  // For providers, also get received reviews
  const receivedReviews = user?.role === 'provider' && !isLoading 
    ? (reviewsData?.receivedReviews || []) 
    : [];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {user?.role === 'customer' ? 'My Reviews' : 'Ratings & Reviews'}
          </h2>
          <p className="text-gray-500">
            {user?.role === 'customer' 
              ? 'See your reviews and pending feedback for services' 
              : 'See what customers are saying about your services'}
          </p>
        </div>
        
        {user?.role === 'provider' && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0 flex items-center">
                  <div className="p-4 bg-amber-100 rounded-full mr-4">
                    <Star className="h-8 w-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-500">
                      {isLoading ? '-' : (reviewsData?.avgRating?.toFixed(1) || '0.0')}
                    </h3>
                    <p className="text-gray-500">Average Rating</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{isLoading ? '-' : (reviewsData?.totalReviews || 0)}</p>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold">{isLoading ? '-' : (reviewsData?.fiveStarCount || 0)}</p>
                    <p className="text-sm text-gray-500">5-Star Ratings</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold">{isLoading ? '-' : (reviewsData?.reviewRatio || '0%')}</p>
                    <p className="text-sm text-gray-500">Review Ratio</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold">{isLoading ? '-' : (reviewsData?.responseRate || '0%')}</p>
                    <p className="text-sm text-gray-500">Response Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <Tabs defaultValue={user?.role === 'provider' ? 'received' : 'pending'}>
              <TabsList className="grid w-full grid-cols-2">
                {user?.role === 'provider' ? (
                  <>
                    <TabsTrigger value="received">Received Reviews</TabsTrigger>
                    <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
                    <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
                  </>
                )}
              </TabsList>
              
              {user?.role === 'provider' && (
                <>
                  <TabsContent value="received" className="mt-6">
                    {renderReceivedReviews()}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="mt-6">
                    {renderPendingReviews()}
                  </TabsContent>
                </>
              )}
              
              {user?.role === 'customer' && (
                <>
                  <TabsContent value="pending" className="mt-6">
                    {renderPendingReviews()}
                  </TabsContent>
                  
                  <TabsContent value="my-reviews" className="mt-6">
                    {renderMyReviews()}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  );

  function renderPendingReviews() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
        </div>
      );
    }

    if (pendingReviews.length === 0) {
      return (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No pending reviews</h3>
          <p className="text-gray-500">
            {user?.role === 'customer' 
              ? 'You have reviewed all your completed services!' 
              : 'All your completed services have been reviewed!'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {pendingReviews.map((booking: any) => (
          <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary bg-opacity-10 rounded-xl">
                  <booking.icon className="h-8 w-8 text-primary" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{booking.serviceType}</h4>
                  <p className="text-gray-500 text-sm">{booking.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Completed: {booking.completedDate}</span>
                    </div>
                    
                    {user?.role === 'customer' && (
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Provider: {booking.provider.name}</span>
                      </div>
                    )}
                    
                    {user?.role === 'provider' && (
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Customer: {booking.customer.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  {user?.role === 'customer' && (
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-all">
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderMyReviews() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
        </div>
      );
    }

    if (myReviews.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
          <p className="text-gray-500">You haven't left any reviews yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {myReviews.map((review: any) => (
          <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Star className="h-8 w-8 text-amber-500" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-semibold text-lg mr-3">{review.serviceType}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{review.comment}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Reviewed on: {review.createdAt}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Provider: {review.provider.name}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">
                    Edit
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderReceivedReviews() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
        </div>
      );
    }

    if (receivedReviews.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
          <p className="text-gray-500">You haven't received any reviews yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {receivedReviews.map((review: any) => (
          <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={review.customer.avatar || `https://ui-avatars.com/api/?name=${review.customer.name}`} 
                    alt="Customer avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h4 className="font-semibold text-lg mr-2">{review.customer.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-2">Service: {review.serviceType}</p>
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{review.createdAt}</span>
                  </div>
                </div>
                
                {!review.providerResponse && (
                  <div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                      Reply
                    </button>
                  </div>
                )}
              </div>
              
              {review.providerResponse && (
                <div className="mt-4 ml-16 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Your response:</p>
                  <p className="text-gray-700 text-sm">{review.providerResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default Reviews;
