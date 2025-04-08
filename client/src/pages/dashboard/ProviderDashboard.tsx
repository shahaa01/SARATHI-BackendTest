import React, { useState } from 'react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  CalendarDays,
  DollarSign,
  Briefcase,
  Star,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash
} from 'lucide-react';
import { Select } from '@/components/ui/select';

const ProviderDashboard: React.FC = () => {
  const { data: user } = useCurrentUser();
  const [chartPeriod, setChartPeriod] = useState('week');
  
  // Fetch provider dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/provider'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard/provider', null);
      return res.json();
    },
  });

  // Extract data from the API response or use defaults when loading
  const stats = isLoading ? {
    todayBookings: 0,
    weeklyEarnings: 0,
    totalJobs: 0,
    rating: 0
  } : dashboardData?.stats;

  const upcomingBookings = isLoading ? [] : dashboardData?.upcomingBookings || [];
  const providerServices = isLoading ? [] : dashboardData?.services || [];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-gray-500">Here's an overview of your business activity.</p>
        </div>
        
        {/* Provider Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Bookings */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Today's Bookings</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.todayBookings}</h3>
                </div>
                <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/bookings">
                  <a className="text-primary text-sm font-medium hover:underline">View schedule</a>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* This Week Earnings */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">This Week Earnings</p>
                  <h3 className="text-2xl font-bold mt-1">₹{stats?.weeklyEarnings?.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/earnings">
                  <a className="text-primary text-sm font-medium hover:underline">View earnings</a>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Jobs */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Jobs</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.totalJobs}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/bookings?filter=completed">
                  <a className="text-primary text-sm font-medium hover:underline">View history</a>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Rating */}
          <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Rating</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.rating.toFixed(1)}</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/reviews">
                  <a className="text-primary text-sm font-medium hover:underline">View reviews</a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Earnings Chart & Upcoming Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Earnings Overview</h3>
                <Select
                  value={chartPeriod}
                  onValueChange={setChartPeriod}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">Last 3 Months</option>
                </Select>
              </div>
              
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">Chart will be rendered here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Upcoming Bookings</h3>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-xs text-gray-500 mt-1">{booking.address}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No upcoming bookings</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Link href="/dashboard/bookings">
                  <a className="text-primary font-medium text-sm hover:underline">View all bookings</a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Service Management Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h3 className="text-xl font-bold">Your Services</h3>
              <Link href="/dashboard/services/new">
                <Button className="mt-3 md:mt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Service
                </Button>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-700 border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Service</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Rate (₹/hr)</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                        </div>
                      </td>
                    </tr>
                  ) : providerServices.length > 0 ? (
                    providerServices.map((service: any) => (
                      <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-primary bg-opacity-10 rounded-lg mr-3">
                              <service.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{service.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{service.rate}</td>
                        <td className="px-6 py-4">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-gray-700 hover:text-primary">
                              <Edit className="h-5 w-5" />
                            </button>
                            <button className="p-1 text-gray-700 hover:text-red-500">
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        You haven't added any services yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Availability Calendar Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">Availability Management</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">May 2023</h4>
                <div className="flex space-x-2">
                  <button className="p-1 rounded-full hover:bg-white transition-all">
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white transition-all">
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>
              
              {/* Calendar Grid - Simple Representation */}
              <div className="grid grid-cols-7 gap-2">
                <div className="text-center text-xs text-gray-500 font-medium py-2">Sun</div>
                <div className="text-center text-xs text-gray-500 font-medium py-2">Mon</div>
                <div className="text-center text-xs text-gray-500 font-medium py-2">Tue</div>
                <div className="text-center text-xs text-gray-500 font-medium py-2">Wed</div>
                <div className="text-center text-xs text-gray-500 font-medium py-2">Thu</div>
                <div className="text-center text-xs text-gray-500 font-medium py-2">Fri</div>
                <div className="text-center text-xs text-gray-500 font-medium py-2">Sat</div>
                
                {/* Calendar days */}
                {Array.from({ length: 35 }).map((_, i) => {
                  // Simple logic to determine dates (this would be replaced with real calendar logic)
                  const day = i - 1;
                  const isCurrentMonth = day > 0 && day <= 31;
                  const date = isCurrentMonth ? day : (day <= 0 ? 30 + day : day - 31);
                  
                  const isToday = isCurrentMonth && date === new Date().getDate();
                  const hasBooking = isCurrentMonth && [3, 10, 15, 24].includes(date);
                  const isDayOff = isCurrentMonth && [22].includes(date);
                  
                  return (
                    <div
                      key={i}
                      className={`h-10 rounded-lg flex items-center justify-center text-sm ${
                        !isCurrentMonth ? 'bg-gray-200 text-gray-400' :
                        isToday ? 'bg-primary text-white' :
                        isDayOff ? 'bg-primary bg-opacity-10 text-primary font-medium' :
                        'bg-white'
                      }`}
                    >
                      {date}
                      {hasBooking && (
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Link href="/dashboard/availability">
              <Button>Manage Availability</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
