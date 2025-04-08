import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertReviewSchema } from '@shared/schema';
import { z } from 'zod';

// Get reviews
export const getReviews = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // For customers - get reviews they've left
    if (user.role === 'customer') {
      const myReviews = await storage.getReviewsByCustomerId(user.id);
      
      // Get details for each review
      const enhancedReviews = await Promise.all(myReviews.map(async (review) => {
        const booking = await storage.getBookingById(review.bookingId);
        const provider = booking ? await storage.getUser(booking.providerId) : null;
        const serviceCategory = booking ? await storage.getServiceCategoryById(booking.serviceCategoryId) : null;
        
        return {
          id: review.id,
          bookingId: review.bookingId,
          rating: review.rating,
          comment: review.comment,
          createdAt: formatDate(review.createdAt),
          serviceType: serviceCategory?.name || 'Unknown Service',
          provider: provider ? {
            id: provider.id,
            name: `${provider.firstName} ${provider.lastName}`,
            avatar: provider.profileImageUrl
          } : null
        };
      }));
      
      // Get bookings that need reviews
      const bookings = await storage.getBookingsByCustomerId(user.id);
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      const pendingReviews = await Promise.all(
        completedBookings.filter(async (booking) => {
          const review = await storage.getReviewByBookingId(booking.id);
          return !review;
        }).map(async (booking) => {
          const serviceCategory = await storage.getServiceCategoryById(booking.serviceCategoryId);
          const provider = await storage.getUser(booking.providerId);
          
          return {
            id: booking.id,
            serviceType: serviceCategory?.name || 'Unknown Service',
            description: booking.description,
            completedDate: formatDate(booking.completedDate || new Date()),
            provider: provider ? {
              id: provider.id,
              name: `${provider.firstName} ${provider.lastName}`,
              avatar: provider.profileImageUrl
            } : null,
            icon: getServiceIcon(serviceCategory?.name || '')
          };
        })
      );
      
      return res.status(200).json({
        myReviews: enhancedReviews,
        pendingReviews
      });
    }
    
    // For providers - get reviews about them
    if (user.role === 'provider') {
      const receivedReviews = await storage.getReviewsByProviderId(user.id);
      
      // Get details for each review
      const enhancedReceivedReviews = await Promise.all(receivedReviews.map(async (review) => {
        const booking = await storage.getBookingById(review.bookingId);
        const customer = booking ? await storage.getUser(booking.customerId) : null;
        const serviceCategory = booking ? await storage.getServiceCategoryById(booking.serviceCategoryId) : null;
        
        return {
          id: review.id,
          bookingId: review.bookingId,
          rating: review.rating,
          comment: review.comment,
          createdAt: formatDate(review.createdAt),
          serviceType: serviceCategory?.name || 'Unknown Service',
          customer: customer ? {
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`,
            avatar: customer.profileImageUrl
          } : null,
          providerResponse: null // This would be populated from a separate collection in a real app
        };
      }));
      
      // Get bookings that need reviews from customer
      const bookings = await storage.getBookingsByProviderId(user.id);
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      const pendingReviews = await Promise.all(
        completedBookings.filter(async (booking) => {
          const review = await storage.getReviewByBookingId(booking.id);
          return !review;
        }).map(async (booking) => {
          const serviceCategory = await storage.getServiceCategoryById(booking.serviceCategoryId);
          const customer = await storage.getUser(booking.customerId);
          
          return {
            id: booking.id,
            serviceType: serviceCategory?.name || 'Unknown Service',
            description: booking.description,
            completedDate: formatDate(booking.completedDate || new Date()),
            customer: customer ? {
              id: customer.id,
              name: `${customer.firstName} ${customer.lastName}`,
              avatar: customer.profileImageUrl
            } : null,
            icon: getServiceIcon(serviceCategory?.name || '')
          };
        })
      );
      
      // Calculate review stats
      const totalReviews = receivedReviews.length;
      const fiveStarCount = receivedReviews.filter(r => r.rating === 5).length;
      const avgRating = totalReviews > 0
        ? receivedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
      
      // Get total completed jobs
      const providerProfile = await storage.getServiceProviderProfile(user.id);
      const totalJobs = providerProfile?.totalJobs || 0;
      
      // Calculate review ratio (% of jobs that got reviews)
      const reviewRatio = totalJobs > 0
        ? `${Math.round((totalReviews / totalJobs) * 100)}%`
        : '0%';
      
      // Response rate is not stored, would be calculated in a real app
      const responseRate = '100%';
      
      return res.status(200).json({
        receivedReviews: enhancedReceivedReviews,
        pendingReviews,
        avgRating,
        totalReviews,
        fiveStarCount,
        reviewRatio,
        responseRate
      });
    }
    
    return res.status(403).json({ message: 'Invalid user role' });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a review
export const createReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Only customers can create reviews
    if (user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can leave reviews' });
    }
    
    // Validate request body
    const reviewSchema = z.object({
      bookingId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string()
    });
    
    const validationResult = reviewSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const reviewData = validationResult.data;
    
    // Get booking
    const booking = await storage.getBookingById(reviewData.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Ensure booking belongs to this customer
    if (booking.customerId !== user.id) {
      return res.status(403).json({ message: 'Cannot review a booking that is not yours' });
    }
    
    // Ensure booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }
    
    // Check if booking already has a review
    const existingReview = await storage.getReviewByBookingId(booking.id);
    if (existingReview) {
      return res.status(400).json({ message: 'Booking already has a review' });
    }
    
    // Create review
    const review = await storage.createReview({
      bookingId: booking.id,
      customerId: user.id,
      providerId: booking.providerId,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    
    // Update provider's average rating
    const providerReviews = await storage.getReviewsByProviderId(booking.providerId);
    const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    
    const providerProfile = await storage.getServiceProviderProfile(booking.providerId);
    if (providerProfile) {
      await storage.updateServiceProviderProfile(booking.providerId, {
        avgRating: Math.round(avgRating * 10) / 10 // Round to 1 decimal place
      });
    }
    
    return res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Reply to a review
export const replyToReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Only providers can reply to reviews
    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Only service providers can reply to reviews' });
    }
    
    // Validate request body
    const replySchema = z.object({
      reply: z.string().min(1)
    });
    
    const validationResult = replySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const { reply } = validationResult.data;
    
    // Get review
    const review = await storage.getReviewById(parseInt(id));
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Ensure review is for this provider
    if (review.providerId !== user.id) {
      return res.status(403).json({ message: 'Cannot reply to a review that is not yours' });
    }
    
    // In a real app, this would be stored in a separate collection or field
    // For now, we'll just return success
    
    return res.status(200).json({
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
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
