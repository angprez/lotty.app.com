import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired"]);
export const listingStatusEnum = pgEnum("listing_status", ["pending", "active", "rejected", "archived"]);
export const currencyEnum = pgEnum("currency", ["PYG", "USD"]);
export const ownerTypeEnum = pgEnum("owner_type", ["owner", "commission_agent", "other"]);
export const titleStatusEnum = pgEnum("title_status", ["has_title", "no_title"]);
export const paymentConditionEnum = pgEnum("payment_condition", ["cash_only", "installments", "barter"]);
export const offerStatusEnum = pgEnum("offer_status", ["pending", "accepted", "rejected"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // email
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planType: text("plan_type").notNull(), // 'diario', 'mensual', '60_dias', '90_dias', 'anual'
  status: subscriptionStatusEnum("status").default("active").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  maxListings: integer("max_listings").notNull(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Required fields
  title: text("title").notNull(),
  description: text("description").notNull(),
  currency: currencyEnum("currency").notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  
  // Location
  department: text("department").notNull(),
  city: text("city").notNull(),
  zone: text("zone").notNull(), // Barrio/Zone
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  googleMapsLink: text("google_maps_link"),

  // Details
  landSize: decimal("land_size", { precision: 10, scale: 2 }).notNull(), // m2
  dimensions: text("dimensions").notNull(), // front/back or width/length
  
  // Owner info
  ownerName: text("owner_name").notNull(),
  ownerType: ownerTypeEnum("owner_type").notNull(),
  titleStatus: titleStatusEnum("title_status").notNull(),
  
  // Contact
  phone: text("phone").notNull(),
  email: text("email"), // Optional
  
  // Payment
  paymentCondition: paymentConditionEnum("payment_condition").notNull(),
  downPayment: decimal("down_payment", { precision: 15, scale: 2 }), // If installments
  barterDescription: text("barter_description"), // If barter
  
  // System
  status: listingStatusEnum("status").default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  rejectionReason: text("rejection_reason"),
  slug: text("slug").unique(), // For friendly URLs
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listingImages = pgTable("listing_images", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  url: text("url").notNull(),
  isTitleDocument: boolean("is_title_document").default(false).notNull(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull(),
  message: text("message"),
  status: offerStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  listings: many(listings),
  chatsAsBuyer: many(chats, { relationName: "buyer" }),
  chatsAsSeller: many(chats, { relationName: "seller" }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  images: many(listingImages),
  comments: many(comments),
  ratings: many(ratings),
  offers: many(offers),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  listing: one(listings, {
    fields: [chats.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [chats.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [chats.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  userId: true, 
  status: true, 
  featured: true, 
  rejectionReason: true, 
  createdAt: true, 
  updatedAt: true,
  slug: true
});
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, buyerId: true, status: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, userId: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, userId: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type ListingImage = typeof listingImages.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
