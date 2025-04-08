import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware } from "./middleware/auth";
import { setupAuth } from "./auth";
import cookieParser from "cookie-parser";

// Import controllers
import * as bookingController from "./controllers/bookingController";
import * as userController from "./controllers/userController";
import * as serviceController from "./controllers/serviceController";
import * as reviewController from "./controllers/reviewController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Set up authentication
  setupAuth(app);

  // User routes
  app.get('/api/users/:id', authMiddleware, userController.getUserById);
  app.patch('/api/users/:id', authMiddleware, userController.updateUserProfile);
  app.patch('/api/users/:id/password', authMiddleware, userController.updatePassword);

  // Dashboard routes
  app.get("/api/dashboard/customer", authMiddleware, userController.getCustomerDashboard);
  app.get("/api/dashboard/provider", authMiddleware, userController.getProviderDashboard);

  // Booking routes
  app.get("/api/bookings", authMiddleware, bookingController.getBookings);
  app.get("/api/bookings/:id", authMiddleware, bookingController.getBookingById);
  app.post("/api/bookings", authMiddleware, bookingController.createBooking);
  app.post("/api/bookings/:id/cancel", authMiddleware, bookingController.cancelBooking);
  app.post("/api/bookings/:id/complete", authMiddleware, bookingController.completeBooking);

  // Service routes
  app.get("/api/services/categories", serviceController.getServiceCategories);
  app.get("/api/services", serviceController.getServices);
  app.get("/api/services/provider/:id", authMiddleware, serviceController.getProviderServices);
  app.post("/api/services", authMiddleware, serviceController.createService);
  app.put("/api/services/:id", authMiddleware, serviceController.updateService);
  app.delete("/api/services/:id", authMiddleware, serviceController.deleteService);

  // Review routes
  app.get("/api/reviews", authMiddleware, reviewController.getReviews);
  app.post("/api/reviews", authMiddleware, reviewController.createReview);
  app.post("/api/reviews/:id/reply", authMiddleware, reviewController.replyToReview);

  // Provider availability routes
  app.get("/api/availability", authMiddleware, userController.getAvailability);
  app.put("/api/availability/weekly", authMiddleware, userController.updateWeeklyAvailability);
  app.post("/api/availability/days-off", authMiddleware, userController.addDayOff);
  app.delete("/api/availability/days-off/:id", authMiddleware, userController.removeDayOff);
  app.post("/api/availability/copy-week", authMiddleware, userController.copyWeekSchedule);
  app.post("/api/availability/unavailable-week", authMiddleware, userController.markWeekUnavailable);

  const httpServer = createServer(app);

  return httpServer;
}
