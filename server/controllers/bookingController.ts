import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertBookingSchema } from '@shared/schema';
import { z } from 'zod';

// Get all bookings for a user (filtered by role and status)
export const getBookings = async (req: Request, res: Response) => {
  try {
    const { status = 'all', role } = req.query;
    const user = req.user;
    
    let bookings;
    
    if (user.role === 'customer') {
      bookings = await storage.getBookingsByCustomerId(user.id);
    } else if (user.role === 'provider') {
      bookings = await storage.getBookingsByProviderId(user.id);
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      bookings = bookings.filter(booking => booking.status === status);
    }
    
    // Get additional data for bookings
    const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
      const serviceCategory = await storage.getServiceCategoryById(booking.serviceCategoryId);
      const customer = await storage.getUser(booking.customerId);
      const provider = await storage.getUser(booking.providerId);
      const review = await storage.getReviewByBookingId(booking.id);
      
      const providerProfile = provider ? 
        await storage.getServiceProviderProfile(provider.id) : null;
      
      return {
        ...booking,
        serviceType: serviceCategory?.name || 'Unknown Service',
        hasReview: !!review,
        customer: customer ? {
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          avatar: customer.profileImageUrl
        } : null,
        provider: provider ? {
          name: `${provider.firstName} ${provider.lastName}`,
          rating: providerProfile?.avgRating || 0,
          jobsCompleted: providerProfile?.totalJobs || 0,
          avatar: provider.profileImageUrl
        } : null
      };
    }));
    
    return res.status(200).json(enhancedBookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const booking = await storage.getBookingById(parseInt(id));
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has access to this booking
    if (user.role === 'customer' && booking.customerId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (user.role === 'provider' && booking.providerId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get additional data
    const serviceCategory = await storage.getServiceCategoryById(booking.serviceCategoryId);
    const customer = await storage.getUser(booking.customerId);
    const provider = await storage.getUser(booking.providerId);
    const review = await storage.getReviewByBookingId(booking.id);
    
    const providerProfile = provider ? 
      await storage.getServiceProviderProfile(provider.id) : null;
    
    const enhancedBooking = {
      ...booking,
      serviceType: serviceCategory?.name || 'Unknown Service',
      hasReview: !!review,
      customer: customer ? {
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        avatar: customer.profileImageUrl
      } : null,
      provider: provider ? {
        name: `${provider.firstName} ${provider.lastName}`,
        rating: providerProfile?.avgRating || 0,
        jobsCompleted: providerProfile?.totalJobs || 0,
        avatar: provider.profileImageUrl
      } : null
    };
    
    return res.status(200).json(enhancedBooking);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Only customers can create bookings
    if (user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can create bookings' });
    }
    
    // Validate request body
    const validationResult = insertBookingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const bookingData = validationResult.data;
    
    // Make sure the customer ID is the current user
    if (bookingData.customerId !== user.id) {
      return res.status(403).json({ message: 'Cannot create booking for another customer' });
    }
    
    // Validate provider exists
    const provider = await storage.getUser(bookingData.providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(400).json({ message: 'Invalid service provider' });
    }
    
    // Validate service category exists
    const serviceCategory = await storage.getServiceCategoryById(bookingData.serviceCategoryId);
    if (!serviceCategory) {
      return res.status(400).json({ message: 'Invalid service category' });
    }
    
    // Create booking
    const booking = await storage.createBooking(bookingData);
    
    return res.status(201).json({ 
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const booking = await storage.getBookingById(parseInt(id));
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has access to cancel this booking
    if (user.role === 'customer' && booking.customerId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (user.role === 'provider' && booking.providerId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ 
        message: `Booking is already ${booking.status} and cannot be cancelled` 
      });
    }
    
    // Cancel booking
    const updatedBooking = await storage.updateBooking(parseInt(id), {
      status: 'cancelled'
    });
    
    return res.status(200).json({ 
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Mark a booking as completed
export const completeBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const booking = await storage.getBookingById(parseInt(id));
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only providers can mark bookings as completed
    if (user.role !== 'provider' || booking.providerId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if booking can be marked as completed
    if (booking.status !== 'accepted') {
      return res.status(400).json({ 
        message: `Booking must be in 'accepted' status to be marked as completed` 
      });
    }
    
    // Mark booking as completed
    const updatedBooking = await storage.updateBooking(parseInt(id), {
      status: 'completed',
      completedDate: new Date()
    });
    
    // Update provider stats
    const providerProfile = await storage.getServiceProviderProfile(user.id);
    if (providerProfile) {
      await storage.updateServiceProviderProfile(user.id, {
        totalJobs: (providerProfile.totalJobs || 0) + 1,
        totalEarnings: (providerProfile.totalEarnings || 0) + (booking.price || 0)
      });
    }
    
    return res.status(200).json({ 
      message: 'Booking marked as completed',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
