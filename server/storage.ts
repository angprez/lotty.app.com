import { db } from "./db";
import {
  users, listings, listingImages, subscriptions, chats, messages, offers, comments, ratings,
  type User, type InsertUser, type Listing, type InsertListing, type Subscription,
  type Chat, type Message, type Offer, type Comment, type Rating, type ListingImage
} from "@shared/schema";
import { eq, and, desc, sql, like, gte, lte } from "drizzle-orm";
import { addDays } from "date-fns";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<(User & { subscription: Subscription | null })[]>;

  // Subscriptions
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: Partial<Subscription>): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;
  checkSubscriptionStatus(userId: number): Promise<boolean>; // Returns true if active

  // Listings
  getListing(id: number): Promise<(Listing & { images: ListingImage[], user: User }) | undefined>;
  getListings(filters?: any): Promise<(Listing & { images: ListingImage[] })[]>;
  createListing(listing: InsertListing, userId: number): Promise<Listing>;
  updateListing(id: number, updates: Partial<Listing>): Promise<Listing>;
  archiveListingsForUser(userId: number): Promise<void>;
  
  // Images
  addImage(listingId: number, url: string, isTitle: boolean): Promise<ListingImage>;
  getListingImages(listingId: number): Promise<ListingImage[]>;

  // Chats & Messages
  createChat(listingId: number, buyerId: number, sellerId: number): Promise<Chat>;
  getChats(userId: number): Promise<(Chat & { listing: Listing, otherUser: User, lastMessage: Message | null })[]>;
  getChatMessages(chatId: number): Promise<Message[]>;
  addMessage(chatId: number, senderId: number, content: string): Promise<Message>;

  // Offers
  createOffer(offer: any): Promise<Offer>;
  updateOfferStatus(id: number, status: string): Promise<Offer>;
  
  // Admin
  getStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<(User & { subscription: Subscription | null })[]> {
    const allUsers = await db.select().from(users);
    const usersWithSub = await Promise.all(allUsers.map(async (u) => {
      const [sub] = await db.select().from(subscriptions)
        .where(eq(subscriptions.userId, u.id))
        .orderBy(desc(subscriptions.endDate))
        .limit(1);
      return { ...u, subscription: sub || null };
    }));
    return usersWithSub;
  }

  async getSubscription(userId: number): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
      .orderBy(desc(subscriptions.endDate))
      .limit(1);
    return sub;
  }

  async createSubscription(sub: any): Promise<Subscription> {
    // Deactivate old active subscriptions
    await db.update(subscriptions)
      .set({ status: 'expired' })
      .where(and(eq(subscriptions.userId, sub.userId), eq(subscriptions.status, 'active')));

    const [newSub] = await db.insert(subscriptions).values(sub).returning();
    
    // Unarchive user listings if they have available slots? 
    // Logic: Admin manually unarchives or user does it.
    
    return newSub;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [updated] = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  async checkSubscriptionStatus(userId: number): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;
    return new Date(sub.endDate) > new Date();
  }

  async getListing(id: number): Promise<(Listing & { images: ListingImage[], user: User }) | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    if (!listing) return undefined;
    
    const images = await db.select().from(listingImages).where(eq(listingImages.listingId, id));
    const [user] = await db.select().from(users).where(eq(users.id, listing.userId));
    
    return { ...listing, images, user };
  }

  async getListings(filters: any = {}): Promise<(Listing & { images: ListingImage[] })[]> {
    let conditions = [];
    
    if (filters.search) {
      conditions.push(sql`(${listings.title} ILIKE ${`%${filters.search}%`} OR ${listings.description} ILIKE ${`%${filters.search}%`})`);
    }
    if (filters.department) conditions.push(eq(listings.department, filters.department));
    if (filters.city) conditions.push(eq(listings.city, filters.city));
    if (filters.zone) conditions.push(eq(listings.zone, filters.zone));
    if (filters.status) conditions.push(eq(listings.status, filters.status));
    if (filters.userId) conditions.push(eq(listings.userId, parseInt(filters.userId)));
    if (filters.minPrice) conditions.push(gte(listings.price, filters.minPrice));
    if (filters.maxPrice) conditions.push(lte(listings.price, filters.maxPrice));

    const result = await db.select().from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt));

    const listingsWithImages = await Promise.all(result.map(async (l) => {
      const images = await db.select().from(listingImages).where(eq(listingImages.listingId, l.id));
      return { ...l, images };
    }));

    return listingsWithImages;
  }

  async createListing(insertListing: InsertListing, userId: number): Promise<Listing> {
    const [listing] = await db.insert(listings).values({ 
      ...insertListing, 
      userId, 
      status: 'pending' 
    }).returning();
    return listing;
  }

  async updateListing(id: number, updates: Partial<Listing>): Promise<Listing> {
    const [updated] = await db.update(listings).set({ ...updates, updatedAt: new Date() }).where(eq(listings.id, id)).returning();
    return updated;
  }

  async archiveListingsForUser(userId: number): Promise<void> {
    await db.update(listings)
      .set({ status: 'archived' })
      .where(eq(listings.userId, userId));
  }

  async addImage(listingId: number, url: string, isTitle: boolean): Promise<ListingImage> {
    const [img] = await db.insert(listingImages).values({ listingId, url, isTitleDocument: isTitle }).returning();
    return img;
  }

  async getListingImages(listingId: number): Promise<ListingImage[]> {
    return await db.select().from(listingImages).where(eq(listingImages.listingId, listingId));
  }

  async createChat(listingId: number, buyerId: number, sellerId: number): Promise<Chat> {
    // Check if exists
    const [existing] = await db.select().from(chats)
      .where(and(
        eq(chats.listingId, listingId),
        eq(chats.buyerId, buyerId),
        eq(chats.sellerId, sellerId)
      ));
    
    if (existing) return existing;

    const [chat] = await db.insert(chats).values({ listingId, buyerId, sellerId }).returning();
    return chat;
  }

  async getChats(userId: number): Promise<(Chat & { listing: Listing, otherUser: User, lastMessage: Message | null })[]> {
    const userChats = await db.select().from(chats)
      .where(sql`${chats.buyerId} = ${userId} OR ${chats.sellerId} = ${userId}`);

    const result = await Promise.all(userChats.map(async (c) => {
      const [listing] = await db.select().from(listings).where(eq(listings.id, c.listingId));
      const otherUserId = c.buyerId === userId ? c.sellerId : c.buyerId;
      const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
      const [lastMessage] = await db.select().from(messages)
        .where(eq(messages.chatId, c.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      return { ...c, listing, otherUser, lastMessage: lastMessage || null };
    }));

    return result;
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }

  async addMessage(chatId: number, senderId: number, content: string): Promise<Message> {
    const [msg] = await db.insert(messages).values({ chatId, senderId, content }).returning();
    return msg;
  }

  async createOffer(offer: any): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async updateOfferStatus(id: number, status: any): Promise<Offer> {
    const [updated] = await db.update(offers).set({ status }).where(eq(offers.id, id)).returning();
    return updated;
  }

  async getStats(): Promise<any> {
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [listingsCount] = await db.select({ count: sql<number>`count(*)` }).from(listings);
    const [activeSubs] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, 'active'));
    const [pendingVerifications] = await db.select({ count: sql<number>`count(*)` }).from(listings).where(eq(listings.status, 'pending'));

    return {
      totalUsers: Number(usersCount.count),
      totalListings: Number(listingsCount.count),
      activeSubscriptions: Number(activeSubs.count),
      pendingVerifications: Number(pendingVerifications.count),
    };
  }
}

export const storage = new DatabaseStorage();
