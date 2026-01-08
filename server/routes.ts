import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertListingSchema, insertOfferSchema } from "@shared/schema";
import pgSession from "connect-pg-simple";
import { pool } from "./db";

const PgSession = pgSession(session);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and WEBP are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session Middleware
  app.use(session({
    store: new PgSession({ 
      pool, 
      createTableIfMissing: true 
    }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production"
    }
  }));

  // Serve uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // --- Auth Routes ---

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) return res.json(null);
    const user = await storage.getUser(req.session.userId);
    res.json(user || null);
  });

  // --- Listings Routes ---

  app.get(api.listings.list.path, async (req, res) => {
    try {
      const filters = req.query;
      // Should filter archived listings if not admin/owner, handled in frontend query mostly
      // But critical requirement: "ARCHIVED listings are NOT visible publicly"
      // So enforce active status for public listings unless filtering by userId (dashboard)
      
      let safeFilters = { ...filters };
      if (!filters.userId) {
        safeFilters.status = 'active'; // Force active for public search
      }

      const listings = await storage.getListings(safeFilters);
      res.json(listings);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.listings.get.path, async (req, res) => {
    const listing = await storage.getListing(Number(req.params.id));
    if (!listing) return res.status(404).json({ message: "Not Found" });
    
    // Privacy check for archived
    if (listing.status === 'archived' && req.session.userId !== listing.userId) {
      // Allow admin?
      const user = req.session.userId ? await storage.getUser(req.session.userId) : null;
      if (!user || user.role !== 'admin') {
        return res.status(404).json({ message: "Not Found (Archived)" });
      }
    }

    res.json(listing);
  });

  app.post(api.listings.create.path, requireAuth, async (req, res) => {
    try {
      // Check subscription
      const hasActiveSub = await storage.checkSubscriptionStatus(req.session.userId);
      const user = await storage.getUser(req.session.userId);
      
      if (!hasActiveSub && user?.role !== 'admin') {
         return res.status(403).json({ message: "No tenés un plan activo. Activá uno en la sección de Planes." });
      }

      // Strict Validation according to requirements
      const input = api.listings.create.input.parse(req.body);
      
      // Price rules: PYG >= 7 digits, USD >= 4 digits
      if (input.currency === 'PYG' && Number(input.price) < 1000000) {
        return res.status(400).json({ message: "El precio en Gs. debe ser de al menos 7 dígitos (1.000.000 Gs.)" });
      }
      if (input.currency === 'USD' && Number(input.price) < 1000) {
        return res.status(400).json({ message: "El precio en USD debe ser de al menos 4 dígitos (1.000 USD)" });
      }

      // Location verification
      if (!input.department || !input.city || !input.zone) {
        return res.status(400).json({ message: "Departamento, Ciudad y Zona son obligatorios" });
      }

      // Map link or coordinates
      if (!input.googleMapsLink && (!input.lat || !input.lng)) {
        return res.status(400).json({ message: "Debes proveer un link de Google Maps o coordenadas GPS" });
      }

      const listing = await storage.createListing(input, req.session.userId);
      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.patch(api.listings.update.path, requireAuth, async (req, res) => {
    try {
      const listing = await storage.getListing(Number(req.params.id));
      if (!listing) return res.status(404).json({ message: "Not Found" });
      
      if (listing.userId !== req.session.userId) {
         const user = await storage.getUser(req.session.userId);
         if (user?.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
      }

      const input = api.listings.update.input.parse(req.body);
      const updated = await storage.updateListing(listing.id, input);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/listings/:id/images", requireAuth, upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    // Check ownership
    const listing = await storage.getListing(Number(req.params.id));
    if (!listing) return res.status(404).json({ message: "Not Found" });
    if (listing.userId !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

    const url = `/uploads/${req.file.filename}`;
    const image = await storage.addImage(listing.id, url, req.body.isTitle === 'true');
    res.status(201).json(image);
  });

  // --- Admin Routes ---

  app.get(api.admin.stats.path, requireAdmin, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get(api.admin.users.path, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post(api.admin.assignPlan.path, requireAdmin, async (req, res) => {
    const userId = Number(req.params.id);
    const { planType, durationDays, maxListings } = req.body;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);
    
    const sub = await storage.createSubscription({
      userId,
      planType,
      status: 'active',
      startDate,
      endDate,
      maxListings
    });
    
    res.json(sub);
  });

  app.post(api.admin.moderateListing.path, requireAdmin, async (req, res) => {
    const { action, reason } = req.body;
    const status = action === 'approve' ? 'active' : 'rejected';
    
    const updated = await storage.updateListing(Number(req.params.id), { 
      status, 
      rejectionReason: reason || null 
    });
    res.json(updated);
  });

  // --- Chats & Offers ---

  app.post(api.chats.create.path, requireAuth, async (req, res) => {
    const { listingId } = req.body;
    const listing = await storage.getListing(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    // Prevent chat if archived
    if (listing.status === 'archived') return res.status(400).json({ message: "Listing is archived" });

    const chat = await storage.createChat(listingId, req.session.userId, listing.userId);
    res.status(201).json(chat);
  });

  app.get(api.chats.list.path, requireAuth, async (req, res) => {
    const chats = await storage.getChats(req.session.userId);
    res.json(chats);
  });

  app.get(api.chats.getMessages.path, requireAuth, async (req, res) => {
    const messages = await storage.getChatMessages(Number(req.params.id));
    res.json(messages);
  });

  app.post(api.chats.sendMessage.path, requireAuth, async (req, res) => {
    const { content } = req.body;
    const message = await storage.addMessage(Number(req.params.id), req.session.userId, content);
    res.status(201).json(message);
  });
  
  app.post(api.offers.create.path, requireAuth, async (req, res) => {
    try {
       const input = insertOfferSchema.parse({ ...req.body, buyerId: req.session.userId });
       const offer = await storage.createOffer(input);
       res.status(201).json(offer);
    } catch(err) {
       res.status(400).json({ message: "Invalid offer" });
    }
  });
  
  app.post(api.offers.respond.path, requireAuth, async (req, res) => {
    const { status } = req.body;
    const updated = await storage.updateOfferStatus(Number(req.params.id), status);
    res.json(updated);
  });


  // --- Background Jobs ---
  
  // Archive expired subscriptions job
  setInterval(async () => {
    try {
      const allUsers = await storage.getAllUsers();
      for (const user of allUsers) {
        if (user.subscription && user.subscription.status === 'active') {
          if (new Date(user.subscription.endDate) < new Date()) {
             console.log(`Subscription expired for user ${user.id}. Archiving listings.`);
             await storage.updateSubscription(user.subscription.id, { status: 'expired' });
             await storage.archiveListingsForUser(user.id);
          }
        }
      }
    } catch (e) {
      console.error("Job error:", e);
    }
  }, 10 * 60 * 1000); // Every 10 minutes for production performance


  // --- Seeding ---
  // Simple check and seed on start
  (async () => {
    const users = await storage.getAllUsers();
    if (users.length === 0) {
      console.log("Seeding database...");
      const adminPass = await bcrypt.hash("admin123", 10);
      await storage.createUser({
        username: "admin@lotty.py",
        password: adminPass,
        fullName: "Admin User",
        phone: "0981000000",
        role: "admin"
      });
      
      const userPass = await bcrypt.hash("user123", 10);
      const user = await storage.createUser({
        username: "user@lotty.py",
        password: userPass,
        fullName: "Juan Perez",
        phone: "0971111111",
        role: "user"
      });
      
      // Give user a plan
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);
      await storage.createSubscription({
         userId: user.id,
         planType: 'monthly',
         status: 'active',
         startDate: now,
         endDate: nextMonth,
         maxListings: -1
      });
      
      // Create listing
      await storage.createListing({
        title: "Terreno en Encarnación",
        description: "Hermoso terreno cerca de la costanera. Ideal para inversión.",
        currency: "USD",
        price: "50000",
        department: "Itapúa",
        city: "Encarnación",
        zone: "Barrio San Pedro",
        landSize: "360",
        dimensions: "12x30",
        ownerName: "Juan Perez",
        ownerType: "owner",
        titleStatus: "has_title",
        phone: "0971111111",
        paymentCondition: "cash_only",
        status: "active",
        featured: true
      }, user.id);
      
      console.log("Database seeded!");
    }
  })();

  return httpServer;
}
