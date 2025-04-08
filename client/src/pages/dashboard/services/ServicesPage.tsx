import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { ServiceIcon } from '@/lib/serviceIcons';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  providersCount: number;
}

const ServicesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Mock data for service categories
  const categories = [
    { id: 1, name: 'Home Improvement' },
    { id: 2, name: 'Professional' },
    { id: 3, name: 'Personal Care' },
    { id: 4, name: 'Transportation' },
    { id: 5, name: 'Education' },
  ];
  
  // Mock data for services
  const services: Service[] = [
    {
      id: 1,
      name: 'Electrician',
      description: 'Professional electrical repair and installation services',
      category: 'Home Improvement',
      price: 500,
      rating: 4.7,
      providersCount: 12
    },
    {
      id: 2,
      name: 'Plumber',
      description: 'Plumbing services, including fixture installation and repair',
      category: 'Home Improvement',
      price: 450,
      rating: 4.5,
      providersCount: 8
    },
    {
      id: 3,
      name: 'Cook',
      description: 'Personal chef services for daily meals or special occasions',
      category: 'Personal Care',
      price: 800,
      rating: 4.9,
      providersCount: 5
    },
    {
      id: 4,
      name: 'Driver',
      description: 'Professional driving services for personal or business needs',
      category: 'Transportation',
      price: 600,
      rating: 4.6,
      providersCount: 15
    },
    {
      id: 5,
      name: 'Tutor',
      description: 'Educational tutoring for various subjects and age groups',
      category: 'Education',
      price: 700,
      rating: 4.8,
      providersCount: 7
    }
  ];
  
  // Filter services based on search query and selected category
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? service.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Services</h1>
          <p className="text-gray-500">Browse and book services from our verified providers</p>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Search for services..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto py-1">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              
              {categories.map(category => (
                <Button 
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center">
                <div className="p-3 bg-primary bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <ServiceIcon name={service.name} className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.category}</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Starting from</span>
                    <p className="text-lg font-semibold">Rs. {service.price}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center text-amber-500 mb-1 text-sm">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span className="text-gray-300">★</span>
                      <span className="ml-1 text-gray-700">{service.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{service.providersCount} providers</p>
                  </div>
                </div>
                
                <Link href={`/dashboard/services/book?service=${service.name}`}>
                  <Button className="w-full">Book Now</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">No services found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;