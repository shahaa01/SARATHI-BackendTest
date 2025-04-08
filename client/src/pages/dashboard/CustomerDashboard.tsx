import React from 'react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CalendarDays, CheckCircle, Star, CreditCard } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch customer dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/customer'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard/customer', null);
      return res.json();
    },
  });

  // Extract data from the API response or use defaults when loading
  const stats = isLoading ? {
    activeBookings: 0,
    completedBookings: 0,
    pendingReviews: 0,
    totalSpent: 0
  } : dashboardData?.stats;

  const upcomingBookings = isLoading ? [] : dashboardData?.upcomingBookings || [];
  const recentServices = isLoading ? [] : dashboardData?.recentServices || [];
  const popularServices = isLoading ? [] : dashboardData?.popularServices || [];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-gray-500">Here's an overview of your recent activity.</p>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Bookings */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Bookings</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.activeBookings}</h3>
                </div>
                <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/bookings" className="text-primary text-sm font-medium hover:underline">
                  View all bookings
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Completed Services */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed Services</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.completedBookings}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/bookings?filter=completed" className="text-primary text-sm font-medium hover:underline">
                  View history
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Pending Reviews */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Reviews</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.pendingReviews}</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/reviews" className="text-primary text-sm font-medium hover:underline">
                  Leave a review
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Spent */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Spent</p>
                  <h3 className="text-2xl font-bold mt-1">₹{stats?.totalSpent?.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/bookings" className="text-primary text-sm font-medium hover:underline">
                  View expenses
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming Bookings */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Upcoming Bookings</h3>
            <Link href="/dashboard/bookings" className="text-primary font-medium hover:underline text-sm">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-primary bg-opacity-10 rounded-xl">
                          <CalendarDays className="h-8 w-8 text-primary" />
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg">{booking.serviceType}</h4>
                          <p className="text-gray-500 text-sm mt-1">{booking.description}</p>
                          
                          <div className="flex items-center mt-3 text-sm text-gray-700">
                            <CalendarDays className="h-5 w-5 mr-2 text-gray-500" />
                            <span>{booking.dateFormatted}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex mt-4 md:mt-0 space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700"
                        >
                          Reschedule
                        </Button>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                          <img 
                            src={booking.provider.avatar || `https://ui-avatars.com/api/?name=${booking.provider.name}`} 
                            alt="Provider avatar" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{booking.provider.name}</p>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span className="ml-1 text-xs text-gray-700">{booking.provider.rating}</span>
                            </div>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-xs text-gray-700">{booking.provider.jobsCompleted} jobs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <h4 className="font-medium text-lg mb-2">No upcoming bookings</h4>
                <p className="text-gray-500 mb-4">You don't have any upcoming service bookings.</p>
                <Button>Book a Service</Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Services */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Services</h3>
            <Link href="/dashboard/bookings?filter=completed" className="text-primary font-medium hover:underline text-sm">
              View all history
            </Link>
          </div>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-700 border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Service</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Provider</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                        </div>
                      </td>
                    </tr>
                  ) : recentServices.length > 0 ? (
                    recentServices.map((service: any) => (
                      <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-primary bg-opacity-10 rounded-lg mr-3">
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{service.serviceType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                              <img 
                                src={service.provider.avatar || `https://ui-avatars.com/api/?name=${service.provider.name}`} 
                                alt="Provider avatar" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm">{service.provider.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{service.completedDate}</td>
                        <td className="px-6 py-4">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.status === 'Completed' ? 'bg-green-100 text-green-600' :
                              service.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {service.hasReview ? (
                            <span className="text-gray-500 text-sm">Reviewed ✓</span>
                          ) : (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-primary hover:text-primary/90 p-0 h-auto"
                            >
                              Leave Review
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">No recent services found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        {/* Quick Book Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">Quick Book a Service</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularServices.map((service: any) => (
                <div 
                  key={service.id}
                  className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="p-3 bg-primary bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{service.name}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button className="w-full py-6">Book New Service</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
