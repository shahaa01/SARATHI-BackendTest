import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DayOff {
  id: number;
  date: string;
  reason?: string;
}

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const Availability: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dayOffReason, setDayOffReason] = useState('');

  // Fetch availability data
  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ['/api/availability'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/availability', null);
      return res.json();
    },
  });

  // Extract availability data
  const weeklySchedule: DaySchedule[] = isLoading ? [] : availabilityData?.weeklySchedule || [];
  const daysOff: DayOff[] = isLoading ? [] : availabilityData?.daysOff || [];

  // Update weekly schedule mutation
  const updateWeeklySchedule = useMutation({
    mutationFn: async (scheduleData: DaySchedule[]) => {
      const res = await apiRequest('PUT', '/api/availability/weekly', { schedule: scheduleData });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
      toast({
        title: "Schedule updated",
        description: "Your weekly availability has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update schedule",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Add day off mutation
  const addDayOff = useMutation({
    mutationFn: async (dayOffData: Omit<DayOff, 'id'>) => {
      const res = await apiRequest('POST', '/api/availability/days-off', dayOffData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
      setSelectedDate(undefined);
      setDayOffReason('');
      toast({
        title: "Day off added",
        description: "Your day off has been scheduled",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add day off",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Remove day off mutation
  const removeDayOff = useMutation({
    mutationFn: async (dayOffId: number) => {
      const res = await apiRequest('DELETE', `/api/availability/days-off/${dayOffId}`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
      toast({
        title: "Day off removed",
        description: "Your day off has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove day off",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Copy current week schedule to next week mutation
  const copySchedule = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/availability/copy-week', null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
      toast({
        title: "Schedule copied",
        description: "This week's schedule has been copied to next week",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to copy schedule",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Mark next week as unavailable mutation
  const markUnavailable = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/availability/unavailable-week', null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
      toast({
        title: "Marked as unavailable",
        description: "You will not receive bookings for next week",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update availability",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle schedule changes
  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    const updatedSchedule = weeklySchedule.map(schedule => 
      schedule.day === day ? { ...schedule, [field]: value } : schedule
    );
    updateWeeklySchedule.mutate(updatedSchedule);
  };

  const handleAvailabilityToggle = (day: string, isAvailable: boolean) => {
    const updatedSchedule = weeklySchedule.map(schedule => 
      schedule.day === day ? { ...schedule, isAvailable } : schedule
    );
    updateWeeklySchedule.mutate(updatedSchedule);
  };

  // Handle day off actions
  const handleAddDayOff = () => {
    if (selectedDate) {
      addDayOff.mutate({
        date: format(selectedDate, 'yyyy-MM-dd'),
        reason: dayOffReason || undefined
      });
    }
  };

  const handleRemoveDayOff = (dayOffId: number) => {
    removeDayOff.mutate(dayOffId);
  };

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // Check if a date is a day off
  const isDayOff = (date: Date) => {
    return daysOff.some(dayOff => 
      dayOff.date === format(date, 'yyyy-MM-dd')
    );
  };

  // Get schedule for a specific day
  const getScheduleForDay = (day: string) => {
    return weeklySchedule.find(schedule => schedule.day === day) || {
      day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: false
    };
  };

  // Loading state
  const isSubmitting = 
    updateWeeklySchedule.isPending || 
    addDayOff.isPending || 
    removeDayOff.isPending || 
    copySchedule.isPending || 
    markUnavailable.isPending;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Availability Management</h2>
          <p className="text-gray-500">Set your working hours and days off</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs text-gray-500 font-medium py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days would be generated dynamically based on the current month */}
                  {/* This is a simplified representation */}
                  {Array.from({ length: 35 }).map((_, i) => {
                    // Simple logic to determine dates
                    const day = i - (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay());
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day + 1);
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isToday = 
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();
                    const dayOff = isDayOff(date);
                    
                    return (
                      <div
                        key={i}
                        className={`h-12 rounded-lg flex items-center justify-center text-sm relative ${
                          !isCurrentMonth ? 'bg-gray-200 text-gray-400' :
                          isToday ? 'bg-primary text-white' :
                          dayOff ? 'bg-primary bg-opacity-10 text-primary font-medium' :
                          'bg-white hover:bg-gray-100 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (isCurrentMonth && !isToday) {
                            setSelectedDate(date);
                          }
                        }}
                      >
                        {date.getDate()}
                        {dayOff && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    <span>Day Off</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full opacity-30 mr-2"></div>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Add Day Off */}
          <Card>
            <CardHeader>
              <CardTitle>Days Off</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Select a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
                  <Input
                    placeholder="e.g., Personal holiday"
                    value={dayOffReason}
                    onChange={(e) => setDayOffReason(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleAddDayOff}
                  disabled={!selectedDate || isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Day Off"}
                </Button>
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="font-medium mb-3">Upcoming Days Off</h4>
                  
                  {isLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-12 bg-gray-200 rounded-lg"></div>
                      <div className="h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                  ) : daysOff.length > 0 ? (
                    <div className="space-y-2">
                      {daysOff.map((dayOff) => (
                        <div 
                          key={dayOff.id} 
                          className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{format(new Date(dayOff.date), 'MMMM d, yyyy')}</div>
                            {dayOff.reason && (
                              <div className="text-xs text-gray-500">{dayOff.reason}</div>
                            )}
                          </div>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveDayOff(dayOff.id)}
                            disabled={isSubmitting}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No upcoming days off scheduled
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
                      onClick={() => markUnavailable.mutate()}
                      disabled={isSubmitting}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Mark as unavailable for next week
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => copySchedule.mutate()}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Copy this week's schedule to next week
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {weekDays.map((day) => {
                  const schedule = getScheduleForDay(day);
                  return (
                    <div key={day} className="flex flex-col md:flex-row md:items-center md:justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="w-24 mb-2 md:mb-0">
                        <span className="font-medium">{day}</span>
                      </div>
                      
                      {schedule.isAvailable ? (
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
                          <div className="flex items-center mb-2 md:mb-0">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <Select
                              value={schedule.startTime}
                              onValueChange={(value) => handleTimeChange(day, 'startTime', value)}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Start Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem 
                                    key={time} 
                                    value={time}
                                    disabled={time >= schedule.endTime}
                                  >
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <span className="hidden md:inline text-gray-400">to</span>
                          
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2 md:hidden" />
                            <Select
                              value={schedule.endTime}
                              onValueChange={(value) => handleTimeChange(day, 'endTime', value)}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="End Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem 
                                    key={time} 
                                    value={time}
                                    disabled={time <= schedule.startTime}
                                  >
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm italic">
                          Not Available
                        </div>
                      )}
                      
                      <div className="mt-2 md:mt-0">
                        <Button
                          variant={schedule.isAvailable ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleAvailabilityToggle(day, !schedule.isAvailable)}
                          disabled={isSubmitting}
                        >
                          {schedule.isAvailable ? "Mark Unavailable" : "Mark Available"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-6">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                <span>Changes to your schedule will be applied immediately.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Availability;
