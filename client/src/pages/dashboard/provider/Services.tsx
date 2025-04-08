import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Edit,
  Trash,
  Plus,
  Package,
  Zap,
  Wrench,
  PaintBucket,
  ChefHat,
  Car,
  Scissors,
  Home,
  Info
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  rate: number;
  status: 'Active' | 'Inactive';
  categoryId: number;
  icon: React.ReactNode;
}

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  basePrice: number;
}

const Services: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();

  // State for service forms
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    id: 0,
    name: '',
    description: '',
    rate: 0,
    status: 'Active',
    categoryId: 0
  });
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Fetch service categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/services/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/services/categories', null);
      return res.json();
    },
  });

  // Fetch provider services
  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ['/api/services/provider'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/services/provider/${user?.id}`, null);
      return res.json();
    },
  });

  // Add new service mutation
  const addService = useMutation({
    mutationFn: async (serviceData: Omit<Service, 'id' | 'icon'>) => {
      const res = await apiRequest('POST', '/api/services', serviceData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
      setIsAddServiceOpen(false);
      resetForm();
      toast({
        title: "Service added successfully",
        description: "Your new service is now available for bookings",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateService = useMutation({
    mutationFn: async (serviceData: Omit<Service, 'icon'>) => {
      const res = await apiRequest('PUT', `/api/services/${serviceData.id}`, serviceData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
      setIsEditServiceOpen(false);
      resetForm();
      toast({
        title: "Service updated successfully",
        description: "Your service has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete service mutation
  const deleteService = useMutation({
    mutationFn: async (serviceId: number) => {
      const res = await apiRequest('DELETE', `/api/services/${serviceId}`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
      setIsDeleteServiceOpen(false);
      setSelectedService(null);
      toast({
        title: "Service deleted",
        description: "Your service has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServiceForm({
      ...serviceForm,
      [name]: name === 'rate' ? Number(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setServiceForm({
      ...serviceForm,
      [name]: name === 'categoryId' ? Number(value) : value,
    });
  };

  const handleStatusChange = (checked: boolean) => {
    setServiceForm({
      ...serviceForm,
      status: checked ? 'Active' : 'Inactive',
    });
  };

  const resetForm = () => {
    setServiceForm({
      id: 0,
      name: '',
      description: '',
      rate: 0,
      status: 'Active',
      categoryId: 0
    });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    addService.mutate({
      name: serviceForm.name,
      description: serviceForm.description,
      rate: serviceForm.rate,
      status: serviceForm.status as 'Active' | 'Inactive',
      categoryId: serviceForm.categoryId,
    });
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    updateService.mutate({
      id: serviceForm.id,
      name: serviceForm.name,
      description: serviceForm.description,
      rate: serviceForm.rate,
      status: serviceForm.status as 'Active' | 'Inactive',
      categoryId: serviceForm.categoryId,
    });
  };

  const handleDeleteService = () => {
    if (selectedService) {
      deleteService.mutate(selectedService.id);
    }
  };

  const openEditDialog = (service: Service) => {
    setServiceForm({
      id: service.id,
      name: service.name,
      description: service.description,
      rate: service.rate,
      status: service.status,
      categoryId: service.categoryId,
    });
    setIsEditServiceOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteServiceOpen(true);
  };

  // Map icon to service category
  const getServiceIcon = (categoryId: number) => {
    const iconMap: Record<number, React.ReactNode> = {
      1: <Zap className="h-5 w-5 text-primary" />, // Electrician
      2: <Wrench className="h-5 w-5 text-primary" />, // Plumber
      3: <PaintBucket className="h-5 w-5 text-primary" />, // Painter
      4: <Scissors className="h-5 w-5 text-primary" />, // Tailor
      5: <ChefHat className="h-5 w-5 text-primary" />, // Cook
      6: <Car className="h-5 w-5 text-primary" />, // Driver
      7: <Home className="h-5 w-5 text-primary" />, // Maid
      8: <Package className="h-5 w-5 text-primary" />, // Default
    };

    return iconMap[categoryId] || iconMap[8];
  };

  // Loading states
  const isLoading = isServicesLoading || isCategoriesLoading;
  const isSubmitting = addService.isPending || updateService.isPending || deleteService.isPending;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Services & Rates</h2>
            <p className="text-gray-500">Manage your service offerings and pricing</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => {
              resetForm();
              setIsAddServiceOpen(true);
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Service
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Services</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                {renderServiceTable('all')}
              </TabsContent>
              
              <TabsContent value="active" className="mt-6">
                {renderServiceTable('Active')}
              </TabsContent>
              
              <TabsContent value="inactive" className="mt-6">
                {renderServiceTable('Inactive')}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
      
      {/* Add Service Dialog */}
      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Add a new service you would like to offer to customers
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddService} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Service Category</Label>
                <Select
                  name="categoryId"
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                  value={serviceForm.categoryId.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isCategoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      categories?.map((category: ServiceCategory) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Electrical Repairs"
                  value={serviceForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Briefly describe your service"
                  value={serviceForm.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate (₹)</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  min="0"
                  placeholder="500"
                  value={serviceForm.rate.toString()}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  {serviceForm.categoryId > 0 && categories ? (
                    <>Recommended base price: ₹{categories.find((c: ServiceCategory) => c.id === serviceForm.categoryId)?.basePrice || '500'}</>
                  ) : (
                    <>Set your hourly rate</>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="status" 
                  checked={serviceForm.status === 'Active'}
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="status">Service is active and available for booking</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddServiceOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Add Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your service details and pricing
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateService} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Service Category</Label>
                <Select
                  name="categoryId"
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                  value={serviceForm.categoryId.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isCategoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      categories?.map((category: ServiceCategory) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Electrical Repairs"
                  value={serviceForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Briefly describe your service"
                  value={serviceForm.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate (₹)</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  min="0"
                  placeholder="500"
                  value={serviceForm.rate.toString()}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="status" 
                  checked={serviceForm.status === 'Active'}
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="status">Service is active and available for booking</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditServiceOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Update Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Service Dialog */}
      <Dialog open={isDeleteServiceOpen} onOpenChange={setIsDeleteServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-primary bg-opacity-10 rounded-lg mr-3">
                    {getServiceIcon(selectedService.categoryId)}
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedService.name}</h4>
                    <p className="text-sm text-gray-500">{selectedService.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteServiceOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteService}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );

  function renderServiceTable(filter: string) {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
        </div>
      );
    }

    const filteredServices = services?.filter((service: Service) => 
      filter === 'all' || service.status === filter
    );

    if (!filteredServices || filteredServices.length === 0) {
      return (
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? "You haven't added any services yet" 
              : `You don't have any ${filter.toLowerCase()} services`}
          </p>
          <Button onClick={() => {
            resetForm();
            setIsAddServiceOpen(true);
          }}>
            Add Your First Service
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-700 border-b border-gray-100">
              <th className="px-6 py-3 text-xs font-semibold uppercase">Service</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Description</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Rate (₹/hr)</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service: Service) => (
              <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-lg mr-3">
                      {getServiceIcon(service.categoryId)}
                    </div>
                    <span className="font-medium">{service.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm max-w-[200px] truncate">{service.description}</td>
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
                    <button 
                      className="p-1 text-gray-700 hover:text-primary"
                      onClick={() => openEditDialog(service)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-1 text-gray-700 hover:text-red-500"
                      onClick={() => openDeleteDialog(service)}
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default Services;
