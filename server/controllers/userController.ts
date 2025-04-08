import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { hashPassword, comparePasswords } from '../auth';

// Get dashboard data for customer
export const getCustomerDashboard = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a customer
    if (user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get bookings for customer
    const allBookings = await storage.getBookingsByCustomerId(user.id);
    
    // Calculate statistics
    const stats = {
      activeBookings: allBookings.filter(b => b.status === 'accepted').length,
      completedBookings: allBookings.filter(b => b.status === 'completed').length,
      pendingReviews: 0,
      totalSpent: 0
    };
    
    // Calculate pending reviews
    for (const booking of allBookings.filter(b => b.status === 'completed')) {
      const review = await storage.getReviewByBookingId(booking.id);
      if (!review) {
        stats.pendingReviews++;
      }
      stats.totalSpent += booking.price || 0;
    }
    
    // Get upcoming bookings (accepted status, sorted by date)
    const upcomingBookings = await Promise.all(
      allBookings
        .filter(b => b.status === 'accepted')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 3)
        .map(async (booking) => {
          const serviceCategory = await storage.getServiceCategoryById(booking.serviceCategoryId);
          const provider = await storage.getUser(booking.providerId);
          const providerProfile = provider ? 
            await storage.getServiceProviderProfile(provider.id) : null;
            
          return {
            id: booking.id,
            serviceType: serviceCategory?.name || 'Unknown Service',
            description: booking.description,
            dateFormatted: formatDate(booking.scheduledDate),
            provider: provider ? {
              name: `${provider.firstName} ${provider.lastName}`,
              rating: providerProfile?.avgRating || 0,
              jobsCompleted: providerProfile?.totalJobs || 0,
              avatar: provider.profileImageUrl
            } : null,
            icon: getServiceIcon(serviceCategory?.name || '')
          };
        })
    );
    
    // Get recent services (completed, sorted by date)
    const recentServices = await Promise.all(
      allBookings
        .filter(b => b.status === 'completed')
        .sort((a, b) => new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime())
        .slice(0, 5)
        .map(async (booking) => {
          const serviceCategory = await storage.getServiceCategoryById(booking.serviceCategoryId);
          const provider = await storage.getUser(booking.providerId);
          const review = await storage.getReviewByBookingId(booking.id);
          const providerProfile = provider ? 
            await storage.getServiceProviderProfile(provider.id) : null;
            
          return {
            id: booking.id,
            serviceType: serviceCategory?.name || 'Unknown Service',
            provider: provider ? {
              name: `${provider.firstName} ${provider.lastName}`,
              avatar: provider.profileImageUrl
            } : null,
            completedDate: formatDate(booking.completedDate || new Date()),
            status: booking.status,
            hasReview: !!review,
            icon: getServiceIcon(serviceCategory?.name || '')
          };
        })
    );
    
    // Get popular services
    const serviceCategories = await storage.getServiceCategories();
    const popularServices = serviceCategories.slice(0, 4).map(category => ({
      id: category.id,
      name: category.name,
      icon: getServiceIcon(category.name)
    }));
    
    return res.status(200).json({
      stats,
      upcomingBookings,
      recentServices,
      popularServices
    });
  } catch (error) {
    console.error('Get customer dashboard error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard data for provider
export const getProviderDashboard = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get provider profile
    const providerProfile = await storage.getServiceProviderProfile(user.id);
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Get bookings for provider
    const allBookings = await storage.getBookingsByProviderId(user.id);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get reviews for provider
    const reviews = await storage.getReviewsByProviderId(user.id);
    
    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    
    // Calculate weekly earnings
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weeklyEarnings = allBookings
      .filter(b => b.status === 'completed' && 
                  new Date(b.completedDate || 0) >= startOfWeek)
      .reduce((sum, booking) => sum + (booking.price || 0), 0);
    
    // Calculate statistics
    const stats = {
      todayBookings: allBookings.filter(b => 
        new Date(b.scheduledDate).toDateString() === today.toDateString() &&
        b.status === 'accepted'
      ).length,
      weeklyEarnings,
      totalJobs: providerProfile.totalJobs || 0,
      rating: avgRating
    };
    
    // Get upcoming bookings (accepted status, sorted by date)
    const upcomingBookings = await Promise.all(
      allBookings
        .filter(b => b.status === 'accepted')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 3)
        .map(async (booking) => {
          const customer = await storage.getUser(booking.customerId);
          const scheduledDate = new Date(booking.scheduledDate);
          const isToday = scheduledDate.toDateString() === today.toDateString();
          
          return {
            id: booking.id,
            customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer',
            address: booking.location || 'No location specified',
            time: isToday
              ? `Today, ${formatTime(scheduledDate)}`
              : `Tomorrow, ${formatTime(scheduledDate)}`,
          };
        })
    );
    
    // Get provider services
    const serviceCategories = await storage.getServiceCategories();
    const services = providerProfile.servicesOffered || [];
    
    // Map services to details including service category name
    const mappedServices = services.map((service: any) => {
      const category = serviceCategories.find(c => c.id === service.categoryId);
      return {
        id: service.id,
        name: service.name,
        rate: service.rate,
        status: service.active ? 'Active' : 'Inactive',
        categoryId: service.categoryId,
        icon: getServiceIcon(category?.name || '')
      };
    });
    
    return res.status(200).json({
      stats,
      upcomingBookings,
      services: mappedServices
    });
  } catch (error) {
    console.error('Get provider dashboard error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get provider availability
export const getAvailability = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get provider profile
    const providerProfile = await storage.getServiceProviderProfile(user.id);
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Get availability data
    const availability = providerProfile.availability || {};
    
    // Format weekly schedule
    const weeklySchedule = Object.entries(availability).map(([day, schedule]: [string, any]) => ({
      day,
      startTime: schedule.start,
      endTime: schedule.end,
      isAvailable: schedule.isAvailable
    }));
    
    // Get days off (this would come from a separate collection in a real app)
    // Here we'll simulate some days off
    const daysOff = [
      {
        id: 1,
        date: '2023-05-24',
        reason: 'Personal holiday'
      },
      {
        id: 2,
        date: '2023-05-31'
      }
    ];
    
    return res.status(200).json({
      weeklySchedule,
      daysOff
    });
  } catch (error) {
    console.error('Get availability error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update weekly availability
export const updateWeeklyAvailability = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Validate request body
    const scheduleSchema = z.array(
      z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        isAvailable: z.boolean()
      })
    );
    
    const validationResult = scheduleSchema.safeParse(req.body.schedule);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const scheduleData = validationResult.data;
    
    // Get provider profile
    const providerProfile = await storage.getServiceProviderProfile(user.id);
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Update availability
    const availability: Record<string, any> = {};
    
    scheduleData.forEach(item => {
      availability[item.day] = {
        start: item.startTime,
        end: item.endTime,
        isAvailable: item.isAvailable
      };
    });
    
    // Update provider profile
    await storage.updateServiceProviderProfile(user.id, {
      availability
    });
    
    return res.status(200).json({
      message: 'Availability updated successfully',
      weeklySchedule: scheduleData
    });
  } catch (error) {
    console.error('Update weekly availability error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add day off
export const addDayOff = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Validate request body
    const dayOffSchema = z.object({
      date: z.string(),
      reason: z.string().optional()
    });
    
    const validationResult = dayOffSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    // In a real app, this would add to a days_off collection
    // For now, we'll just return success
    
    return res.status(200).json({
      message: 'Day off added successfully',
      dayOff: {
        id: Math.floor(Math.random() * 1000) + 1,
        ...validationResult.data
      }
    });
  } catch (error) {
    console.error('Add day off error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Remove day off
export const removeDayOff = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // In a real app, this would remove from a days_off collection
    // For now, we'll just return success
    
    return res.status(200).json({
      message: 'Day off removed successfully'
    });
  } catch (error) {
    console.error('Remove day off error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Copy week schedule
export const copyWeekSchedule = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // In a real app, this would copy the current week to next week
    // For now, we'll just return success
    
    return res.status(200).json({
      message: 'Schedule copied successfully'
    });
  } catch (error) {
    console.error('Copy week schedule error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Mark week as unavailable
export const markWeekUnavailable = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Ensure user is a provider
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // In a real app, this would mark all days next week as unavailable
    // For now, we'll just return success
    
    return res.status(200).json({
      message: 'Next week marked as unavailable'
    });
  } catch (error) {
    console.error('Mark week unavailable error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getServiceIcon(serviceName: string) {
  // This would return an icon component based on service name
  // In a real app, we would import and use the actual React components
  return { type: 'lucide-icon', name: getIconName(serviceName) };
}

function getIconName(serviceName: string): string {
  const iconMap: Record<string, string> = {
    'Electrician': 'ZapIcon',
    'Plumber': 'DropletIcon',
    'Painter': 'PaintBucketIcon',
    'Tailor': 'ScissorsIcon',
    'Cook': 'ChefHatIcon',
    'Driver': 'CarIcon',
    'Maid': 'HomeIcon',
    'Gardener': 'FlowerIcon',
    'Carpenter': 'HammerIcon',
    'Beautician': 'Makeup'
  };
  
  return iconMap[serviceName] || 'ToolIcon';
}

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to user data' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to update user data' });
    }
    
    // Validate request body
    const profileSchema = z.object({
      firstName: z.string().min(2, 'First name must be at least 2 characters'),
      lastName: z.string().min(2, 'Last name must be at least 2 characters'),
      email: z.string().email('Please enter a valid email address'),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      profileImageUrl: z.string().url().optional().or(z.literal('')),
    });
    
    const validationResult = profileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const updateData = validationResult.data;
    
    // Check if email already exists for different user
    if (updateData.email) {
      const existingUser = await storage.getUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    const updatedUser = await storage.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update user password
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to update password' });
    }
    
    // Validate request body
    const passwordSchema = z.object({
      currentPassword: z.string().min(6, 'Current password is required'),
      newPassword: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Please confirm your password'),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
    
    const validationResult = passwordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const { currentPassword, newPassword } = validationResult.data;
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password using comparePasswords from auth module
    const isPasswordValid = await comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password with hashed password
    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update password' });
    }
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
