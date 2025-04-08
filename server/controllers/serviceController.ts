import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertServiceCategorySchema } from '@shared/schema';
import { z } from 'zod';

// Get all service categories
export const getServiceCategories = async (req: Request, res: Response) => {
  try {
    const categories = await storage.getServiceCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get service categories error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all services
export const getServices = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    // Get all service providers
    const providers = Array.from((await storage.users.values()))
      .filter(user => user.role === 'provider');
    
    // Get profiles for each provider
    const providerProfiles = await Promise.all(
      providers.map(async (provider) => {
        return {
          provider,
          profile: await storage.getServiceProviderProfile(provider.id)
        };
      })
    );
    
    // Collect all services
    const allServices: any[] = [];
    
    providerProfiles.forEach(({ provider, profile }) => {
      if (profile && profile.servicesOffered) {
        const services = Array.isArray(profile.servicesOffered) 
          ? profile.servicesOffered
          : [];
          
        services.forEach(service => {
          if (!category || service.categoryId === parseInt(category as string)) {
            allServices.push({
              id: service.id,
              name: service.name,
              providerId: provider.id,
              providerName: `${provider.firstName} ${provider.lastName}`,
              rating: profile.avgRating || 0,
              jobsCompleted: profile.totalJobs || 0,
              hourlyRate: service.rate,
              categoryId: service.categoryId
            });
          }
        });
      }
    });
    
    return res.status(200).json(allServices);
  } catch (error) {
    console.error('Get services error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get services for a specific provider
export const getProviderServices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if the requested provider ID matches the authenticated user
    if (user.role === 'provider' && user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get provider
    const provider = await storage.getUser(parseInt(id));
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Get provider profile
    const profile = await storage.getServiceProviderProfile(provider.id);
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Get services
    const services = profile.servicesOffered || [];
    
    return res.status(200).json(services);
  } catch (error) {
    console.error('Get provider services error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new service for a provider
export const createService = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Only service providers can create services' });
    }
    
    // Validate request body
    const serviceSchema = z.object({
      name: z.string().min(3),
      description: z.string(),
      rate: z.number().min(0),
      status: z.enum(['Active', 'Inactive']),
      categoryId: z.number()
    });
    
    const validationResult = serviceSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const serviceData = validationResult.data;
    
    // Get provider profile
    const profile = await storage.getServiceProviderProfile(user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Get existing services
    const services = Array.isArray(profile.servicesOffered) 
      ? profile.servicesOffered
      : [];
    
    // Create new service
    const newService = {
      id: services.length > 0 
        ? Math.max(...services.map(s => s.id)) + 1 
        : 1,
      name: serviceData.name,
      description: serviceData.description,
      rate: serviceData.rate,
      active: serviceData.status === 'Active',
      categoryId: serviceData.categoryId
    };
    
    // Add service to provider's offerings
    services.push(newService);
    
    // Update provider profile
    await storage.updateServiceProviderProfile(user.id, {
      servicesOffered: services
    });
    
    return res.status(201).json({
      message: 'Service created successfully',
      service: {
        ...newService,
        status: serviceData.status
      }
    });
  } catch (error) {
    console.error('Create service error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update a service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Only service providers can update services' });
    }
    
    // Validate request body
    const serviceSchema = z.object({
      id: z.number(),
      name: z.string().min(3),
      description: z.string(),
      rate: z.number().min(0),
      status: z.enum(['Active', 'Inactive']),
      categoryId: z.number()
    });
    
    const validationResult = serviceSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const serviceData = validationResult.data;
    
    // Get provider profile
    const profile = await storage.getServiceProviderProfile(user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Get existing services
    const services = Array.isArray(profile.servicesOffered) 
      ? profile.servicesOffered
      : [];
    
    // Find service to update
    const serviceIndex = services.findIndex(s => s.id === parseInt(id));
    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Update service
    services[serviceIndex] = {
      id: parseInt(id),
      name: serviceData.name,
      description: serviceData.description,
      rate: serviceData.rate,
      active: serviceData.status === 'Active',
      categoryId: serviceData.categoryId
    };
    
    // Update provider profile
    await storage.updateServiceProviderProfile(user.id, {
      servicesOffered: services
    });
    
    return res.status(200).json({
      message: 'Service updated successfully',
      service: {
        ...services[serviceIndex],
        status: serviceData.status
      }
    });
  } catch (error) {
    console.error('Update service error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Only service providers can delete services' });
    }
    
    // Get provider profile
    const profile = await storage.getServiceProviderProfile(user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Get existing services
    const services = Array.isArray(profile.servicesOffered) 
      ? profile.servicesOffered
      : [];
    
    // Find service to delete
    const serviceIndex = services.findIndex(s => s.id === parseInt(id));
    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Remove service
    services.splice(serviceIndex, 1);
    
    // Update provider profile
    await storage.updateServiceProviderProfile(user.id, {
      servicesOffered: services
    });
    
    return res.status(200).json({
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
