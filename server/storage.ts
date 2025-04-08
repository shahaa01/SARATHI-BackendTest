import {
  users,
  type User,
  type InsertUser,
  serviceProviderProfiles,
  type ServiceProviderProfile,
  type InsertServiceProviderProfile,
  serviceCategories,
  type ServiceCategory,
  type InsertServiceCategory,
  bookings,
  type Booking,
  type InsertBooking,
  reviews,
  type Review,
  type InsertReview
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);

// Define the storage interface with all CRUD methods needed
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Service Provider Profile methods
  getServiceProviderProfile(userId: number): Promise<ServiceProviderProfile | undefined>;
  createServiceProviderProfile(profile: InsertServiceProviderProfile): Promise<ServiceProviderProfile>;
  updateServiceProviderProfile(userId: number, profileData: Partial<ServiceProviderProfile>): Promise<ServiceProviderProfile | undefined>;
  
  // Service Category methods
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategoryById(id: number): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  
  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBookingsByCustomerId(customerId: number): Promise<Booking[]>;
  getBookingsByProviderId(providerId: number): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined>;
  
  // Review methods
  getReviews(): Promise<Review[]>;
  getReviewsByCustomerId(customerId: number): Promise<Review[]>;
  getReviewsByProviderId(providerId: number): Promise<Review[]>;
  getReviewByBookingId(bookingId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private serviceProviderProfiles: Map<number, ServiceProviderProfile>;
  private serviceCategories: Map<number, ServiceCategory>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  
  private userCurrentId: number;
  private profileCurrentId: number;
  private categoryCurrentId: number;
  private bookingCurrentId: number;
  private reviewCurrentId: number;
  
  // Session store for authentication
  public sessionStore: session.Store;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.serviceProviderProfiles = new Map();
    this.serviceCategories = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    
    // Initialize IDs
    this.userCurrentId = 1;
    this.profileCurrentId = 1;
    this.categoryCurrentId = 1;
    this.bookingCurrentId = 1;
    this.reviewCurrentId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with some default service categories
    this.initializeServiceCategories();
  }

  // Initialize sample service categories
  private initializeServiceCategories() {
    const categories = [
      { name: "Electrician", description: "Electrical repairs and installations", basePrice: 550, imageUrl: "" },
      { name: "Plumber", description: "Plumbing repairs and installations", basePrice: 500, imageUrl: "" },
      { name: "Painter", description: "House painting and decorating", basePrice: 450, imageUrl: "" },
      { name: "Tailor", description: "Clothing alterations and repairs", basePrice: 400, imageUrl: "" },
      { name: "Cook", description: "Cooking and catering services", basePrice: 350, imageUrl: "" },
      { name: "Driver", description: "Professional driving services", basePrice: 400, imageUrl: "" },
      { name: "Maid", description: "House cleaning and maintenance", basePrice: 300, imageUrl: "" }
    ];
    
    categories.forEach(category => {
      this.createServiceCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    // Ensure required fields are present
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      role: insertUser.role || 'customer', // Default role
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      city: insertUser.city || null,
      profileImageUrl: insertUser.profileImageUrl || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Service Provider Profile methods
  async getServiceProviderProfile(userId: number): Promise<ServiceProviderProfile | undefined> {
    return Array.from(this.serviceProviderProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createServiceProviderProfile(profile: InsertServiceProviderProfile): Promise<ServiceProviderProfile> {
    const id = this.profileCurrentId++;
    const createdAt = new Date();
    const serviceProviderProfile: ServiceProviderProfile = { 
      ...profile, 
      id, 
      createdAt, 
      bio: profile.bio || null,
      experience: profile.experience || null,
      hourlyRate: profile.hourlyRate || null,
      servicesOffered: profile.servicesOffered || [],
      availability: profile.availability || {},
      isVerified: false, 
      totalJobs: 0, 
      totalEarnings: 0, 
      avgRating: 0
    };
    this.serviceProviderProfiles.set(id, serviceProviderProfile);
    return serviceProviderProfile;
  }

  async updateServiceProviderProfile(userId: number, profileData: Partial<ServiceProviderProfile>): Promise<ServiceProviderProfile | undefined> {
    const profile = Array.from(this.serviceProviderProfiles.values()).find(
      (profile) => profile.userId === userId
    );
    
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.serviceProviderProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Service Category methods
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.serviceCategories.values());
  }

  async getServiceCategoryById(id: number): Promise<ServiceCategory | undefined> {
    return this.serviceCategories.get(id);
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const id = this.categoryCurrentId++;
    const createdAt = new Date();
    const serviceCategory: ServiceCategory = { 
      ...category, 
      id, 
      createdAt,
      description: category.description || null,
      imageUrl: category.imageUrl || null,
      basePrice: category.basePrice || null
    };
    this.serviceCategories.set(id, serviceCategory);
    return serviceCategory;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingsByCustomerId(customerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.customerId === customerId
    );
  }

  async getBookingsByProviderId(providerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.providerId === providerId
    );
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingCurrentId++;
    const createdAt = new Date();
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt,
      status: booking.status || 'pending',
      description: booking.description || null,
      location: booking.location || null,
      price: booking.price || null,
      completedDate: null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review methods
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getReviewsByCustomerId(customerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.customerId === customerId
    );
  }

  async getReviewsByProviderId(providerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.providerId === providerId
    );
  }

  async getReviewByBookingId(bookingId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      (review) => review.bookingId === bookingId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const createdAt = new Date();
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt,
      comment: review.comment || null
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...reviewData };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }
}

export const storage = new MemStorage();
