import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with role-based authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("customer"), // customer or provider
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city").default("Kathmandu"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for creating a new user
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Service provider profile with additional details
export const serviceProviderProfiles = pgTable("service_provider_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  bio: text("bio"),
  experience: integer("experience").default(0), // years of experience
  hourlyRate: integer("hourly_rate"), // in Nepalese Rupees
  isVerified: boolean("is_verified").default(false),
  servicesOffered: jsonb("services_offered"), // array of service category IDs
  totalJobs: integer("total_jobs").default(0),
  totalEarnings: integer("total_earnings").default(0),
  avgRating: integer("avg_rating").default(0),
  availability: jsonb("availability"), // JSON object with weekly schedule
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for creating or updating a service provider profile
export const insertServiceProviderProfileSchema = createInsertSchema(serviceProviderProfiles)
  .omit({ id: true, createdAt: true, isVerified: true, totalJobs: true, totalEarnings: true, avgRating: true });

// Service categories
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  basePrice: integer("base_price"), // recommended base price
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for creating a service category
export const insertServiceCategorySchema = createInsertSchema(serviceCategories)
  .omit({ id: true, createdAt: true });

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  providerId: integer("provider_id").notNull(),
  serviceCategoryId: integer("service_category_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, completed, cancelled
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  description: text("description"),
  location: text("location"),
  price: integer("price"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for creating a booking
export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, completedDate: true, createdAt: true });

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  providerId: integer("provider_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for creating a review
export const insertReviewSchema = createInsertSchema(reviews)
  .omit({ id: true, createdAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ServiceProviderProfile = typeof serviceProviderProfiles.$inferSelect;
export type InsertServiceProviderProfile = z.infer<typeof insertServiceProviderProfileSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
