import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceIcon } from '@/lib/serviceIcons';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CreditCard, 
  CheckCircle 
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const BookingPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const selectedServiceName = searchParams.get('service');
  
  const [activeStep, setActiveStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  
  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
    '05:00 PM', '06:00 PM'
  ];
  
  // Mock data for services
  const services = [
    { id: 1, name: 'Electrician', basePrice: 500 },
    { id: 2, name: 'Plumber', basePrice: 450 },
    { id: 3, name: 'Cook', basePrice: 800 },
    { id: 4, name: 'Driver', basePrice: 600 },
    { id: 5, name: 'Tutor', basePrice: 700 }
  ];
  
  // Mock data for service providers
  const providers = [
    { 
      id: 1, 
      name: 'Rajan Sharma', 
      rating: 4.8, 
      totalJobs: 124, 
      experience: '4 years',
      price: 550,
      availableDates: ['2023-04-08', '2023-04-09', '2023-04-10'],
      image: 'https://ui-avatars.com/api/?name=Rajan+Sharma&background=random'
    },
    { 
      id: 2, 
      name: 'Priya Thapa', 
      rating: 4.9, 
      totalJobs: 98, 
      experience: '3 years',
      price: 500,
      availableDates: ['2023-04-08', '2023-04-11', '2023-04-12'],
      image: 'https://ui-avatars.com/api/?name=Priya+Thapa&background=random'
    },
    { 
      id: 3, 
      name: 'Ramesh KC', 
      rating: 4.7, 
      totalJobs: 156, 
      experience: '5 years',
      price: 600,
      availableDates: ['2023-04-09', '2023-04-10', '2023-04-11'],
      image: 'https://ui-avatars.com/api/?name=Ramesh+KC&background=random'
    }
  ];
  
  // Find the selected service
  const selectedService = services.find(service => 
    service.name.toLowerCase() === (selectedServiceName ? selectedServiceName.toLowerCase() : '')
  ) || services[0];
  
  // Function to check if date is available for the selected provider
  const isDateAvailable = (date: Date) => {
    if (!selectedProvider) return true;
    
    const provider = providers.find(p => p.id.toString() === selectedProvider);
    if (!provider) return true;
    
    const dateString = date.toISOString().split('T')[0];
    return provider.availableDates.includes(dateString);
  };
  
  // Next step handler
  const handleNextStep = () => {
    if (activeStep === 1 && !selectedProvider) {
      toast({
        title: "Provider selection required",
        description: "Please select a service provider to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (activeStep === 2 && (!selectedDate || !selectedTime)) {
      toast({
        title: "Date and time required",
        description: "Please select both date and time for your booking",
        variant: "destructive",
      });
      return;
    }
    
    if (activeStep === 3 && !address) {
      toast({
        title: "Address required",
        description: "Please provide your address for the service",
        variant: "destructive",
      });
      return;
    }
    
    if (activeStep === 4 && !paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method to proceed",
        variant: "destructive",
      });
      return;
    }
    
    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
    }
  };
  
  // Submit booking handler
  const handleSubmitBooking = () => {
    // Create booking object
    const booking = {
      serviceId: selectedService.id,
      providerId: selectedProvider,
      date: selectedDate,
      time: selectedTime,
      address,
      notes,
      paymentMethod,
      totalAmount: selectedProvider 
        ? providers.find(p => p.id.toString() === selectedProvider)?.price || 0 
        : 0
    };
    
    // Success message
    toast({
      title: "Booking Successful!",
      description: `Your ${selectedService.name} service has been booked successfully.`,
      variant: "default",
    });
    
    // Redirect to bookings page
    setTimeout(() => {
      setLocation('/dashboard/bookings');
    }, 2000);
  };
  
  // Calculate progress percentage
  const progressPercentage = (activeStep / 5) * 100;
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Book a Service</h1>
          <p className="text-gray-500">Complete the steps below to book your service</p>
          
          {/* Progress bar */}
          <div className="mt-6 relative">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-2 text-sm">
              <span className={activeStep >= 1 ? "text-primary font-medium" : "text-gray-400"}>
                Select Provider
              </span>
              <span className={activeStep >= 2 ? "text-primary font-medium" : "text-gray-400"}>
                Schedule
              </span>
              <span className={activeStep >= 3 ? "text-primary font-medium" : "text-gray-400"}>
                Address
              </span>
              <span className={activeStep >= 4 ? "text-primary font-medium" : "text-gray-400"}>
                Payment
              </span>
              <span className={activeStep >= 5 ? "text-primary font-medium" : "text-gray-400"}>
                Confirm
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Select Provider */}
            {activeStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                      <ServiceIcon name={selectedService.name} className="h-5 w-5 text-primary" />
                    </div>
                    <span>{selectedService.name} Service</span>
                  </CardTitle>
                  <CardDescription>Select a service provider from our verified professionals</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {providers.map(provider => (
                      <div 
                        key={provider.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedProvider === provider.id.toString() 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider(provider.id.toString())}
                      >
                        <div className="flex items-start">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                            <img 
                              src={provider.image} 
                              alt={provider.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{provider.name}</h3>
                              <p className="font-semibold">Rs. {provider.price}</p>
                            </div>
                            
                            <div className="flex items-center mt-1">
                              <div className="flex text-amber-500 mr-2">
                                <span>★</span>
                                <span>★</span>
                                <span>★</span>
                                <span>★</span>
                                <span className="text-gray-300">★</span>
                              </div>
                              <span className="text-sm text-gray-700">{provider.rating} ({provider.totalJobs} jobs)</span>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {provider.experience} experience
                              </span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Available within 24hrs
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleNextStep}>
                        Next Step <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Step 2: Schedule */}
            {activeStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                    <span>Schedule Your Service</span>
                  </CardTitle>
                  <CardDescription>Select a date and time for your service</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block">Select Date</Label>
                      <div className="border rounded-md">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            console.log("Date selected:", date);
                            setSelectedDate(date);
                          }}
                          disabled={(date) => 
                            date < new Date() || 
                            date > new Date(new Date().setMonth(new Date().getMonth() + 3)) ||
                            !isDateAvailable(date)
                          }
                          className="rounded-md"
                          styles={{
                            day: { cursor: 'pointer !important' },
                            button: { cursor: 'pointer !important' },
                            cell: { cursor: 'pointer !important' }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Select Time</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map(time => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setSelectedTime(time)}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleNextStep}>
                      Next Step <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Step 3: Address */}
            {activeStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>Service Location</span>
                  </CardTitle>
                  <CardDescription>Provide the address where the service will be performed</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Full Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Special Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special instructions for the service provider..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => setActiveStep(2)}>
                        Back
                      </Button>
                      <Button onClick={handleNextStep}>
                        Next Step <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Step 4: Payment */}
            {activeStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    <span>Payment Method</span>
                  </CardTitle>
                  <CardDescription>Select how you would like to pay for the service</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-full mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">Cash on Delivery</h3>
                              <p className="text-sm text-gray-500">Pay when the service is complete</p>
                            </div>
                          </div>
                          {paymentMethod === 'cash' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-full mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">Credit/Debit Card</h3>
                              <p className="text-sm text-gray-500">Pay securely with your card</p>
                            </div>
                          </div>
                          {paymentMethod === 'card' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'khalti' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('khalti')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-full mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">Khalti Wallet</h3>
                              <p className="text-sm text-gray-500">Pay using your Khalti account</p>
                            </div>
                          </div>
                          {paymentMethod === 'khalti' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => setActiveStep(3)}>
                        Back
                      </Button>
                      <Button onClick={handleNextStep}>
                        Next Step <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Step 5: Confirmation */}
            {activeStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    <span>Confirm Booking</span>
                  </CardTitle>
                  <CardDescription>Review your booking details before confirming</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-primary bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                          <ServiceIcon name={selectedService.name} className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{selectedService.name} Service</h3>
                          <p className="text-sm text-gray-500">
                            {selectedProvider && providers.find(p => p.id.toString() === selectedProvider)?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Date & Time</h4>
                          <p className="text-gray-700">
                            {selectedDate?.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-gray-700">{selectedTime}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Service Location</h4>
                          <p className="text-gray-700">{address}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Payment Method</h4>
                          <p className="text-gray-700 capitalize">{paymentMethod}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Total Amount</h4>
                          <p className="text-gray-700 font-bold">
                            Rs. {selectedProvider 
                              ? providers.find(p => p.id.toString() === selectedProvider)?.price || 0 
                              : 0
                            }
                          </p>
                        </div>
                      </div>
                      
                      {notes && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-1">Special Instructions</h4>
                          <p className="text-gray-700">{notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => setActiveStep(4)}>
                        Back
                      </Button>
                      <Button onClick={handleSubmitBooking}>
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                      <ServiceIcon name={selectedService.name} className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedService.name}</h3>
                      <p className="text-sm text-gray-500">Base price: Rs. {selectedService.basePrice}</p>
                    </div>
                  </div>
                  
                  {selectedProvider && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium mb-2">Selected Provider</h4>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img 
                            src={providers.find(p => p.id.toString() === selectedProvider)?.image || ''} 
                            alt="Provider" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {providers.find(p => p.id.toString() === selectedProvider)?.name || ''}
                          </p>
                          <div className="flex text-amber-500 text-xs">
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span className="text-gray-300">★</span>
                            <span className="ml-1 text-gray-700">
                              {providers.find(p => p.id.toString() === selectedProvider)?.rating || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedDate && selectedTime && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium mb-2">Date & Time</h4>
                      <div className="flex items-center text-gray-700">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-gray-700 mt-1">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedTime}
                      </div>
                    </div>
                  )}
                  
                  {address && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium mb-2">Service Location</h4>
                      <div className="flex text-gray-700">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 shrink-0 mt-0.5" />
                        <span>{address}</span>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium mb-2">Payment Method</h4>
                      <div className="flex items-center text-gray-700">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="capitalize">{paymentMethod}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Price Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Charge</span>
                        <span>
                          Rs. {selectedProvider 
                            ? providers.find(p => p.id.toString() === selectedProvider)?.price || 0 
                            : 0
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform Fee</span>
                        <span>Rs. 50</span>
                      </div>
                      <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                        <span>Total Amount</span>
                        <span>
                          Rs. {selectedProvider 
                            ? (providers.find(p => p.id.toString() === selectedProvider)?.price || 0) + 50
                            : 50
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Help Section */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions or need assistance, our support team is here to help!
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingPage;