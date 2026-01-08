import { z } from 'zod';
import { insertUserSchema, insertListingSchema, insertOfferSchema, insertCommentSchema, insertRatingSchema, listings, users, subscriptions, chats, messages, offers, comments, ratings, listingImages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  })
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  },
  listings: {
    list: {
      method: 'GET' as const,
      path: '/api/listings',
      input: z.object({
        search: z.string().optional(),
        department: z.string().optional(),
        city: z.string().optional(),
        zone: z.string().optional(),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        currency: z.enum(["PYG", "USD"]).optional(),
        minSize: z.coerce.number().optional(),
        maxSize: z.coerce.number().optional(),
        ownerType: z.enum(["owner", "commission_agent", "other"]).optional(),
        ownerName: z.string().optional(),
        minRating: z.coerce.number().optional(),
        titleStatus: z.enum(["has_title", "no_title"]).optional(),
        paymentCondition: z.enum(["cash_only", "installments", "barter"]).optional(),
        sortBy: z.enum(["az", "price_asc", "price_desc", "newest"]).optional(),
        status: z.enum(["active", "pending", "archived", "rejected"]).optional(),
        userId: z.string().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof listings.$inferSelect & { images: typeof listingImages.$inferSelect[] }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/listings/:id',
      responses: {
        200: z.custom<typeof listings.$inferSelect & { images: typeof listingImages.$inferSelect[], user: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/listings',
      input: insertListingSchema,
      responses: {
        201: z.custom<typeof listings.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden, // No active subscription
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/listings/:id',
      input: insertListingSchema.partial().extend({ status: z.string().optional() }),
      responses: {
        200: z.custom<typeof listings.$inferSelect>(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    uploadImage: {
      method: 'POST' as const,
      path: '/api/listings/:id/images',
      // multipart form data not strictly typed in Zod for input
      responses: {
        201: z.custom<typeof listingImages.$inferSelect>(),
      },
    }
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalListings: z.number(),
          activeSubscriptions: z.number(),
          pendingVerifications: z.number(),
        }),
        403: errorSchemas.forbidden,
      },
    },
    users: {
      method: 'GET' as const,
      path: '/api/admin/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { subscription: typeof subscriptions.$inferSelect | null }>()),
      },
    },
    assignPlan: {
      method: 'POST' as const,
      path: '/api/admin/users/:id/plan',
      input: z.object({
        planType: z.string(),
        durationDays: z.number(),
        maxListings: z.number(),
      }),
      responses: {
        200: z.custom<typeof subscriptions.$inferSelect>(),
      },
    },
    moderateListing: {
      method: 'POST' as const,
      path: '/api/admin/listings/:id/moderate',
      input: z.object({
        action: z.enum(['approve', 'reject']),
        reason: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof listings.$inferSelect>(),
      },
    }
  },
  chats: {
    create: {
      method: 'POST' as const,
      path: '/api/chats',
      input: z.object({ listingId: z.number() }),
      responses: {
        201: z.custom<typeof chats.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/chats',
      responses: {
        200: z.array(z.custom<typeof chats.$inferSelect & { listing: typeof listings.$inferSelect, otherUser: typeof users.$inferSelect, lastMessage: typeof messages.$inferSelect | null }>()),
      },
    },
    getMessages: {
      method: 'GET' as const,
      path: '/api/chats/:id/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    sendMessage: {
      method: 'POST' as const,
      path: '/api/chats/:id/messages',
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    }
  },
  offers: {
    create: {
      method: 'POST' as const,
      path: '/api/offers',
      input: insertOfferSchema,
      responses: {
        201: z.custom<typeof offers.$inferSelect>(),
      },
    },
    respond: {
      method: 'POST' as const,
      path: '/api/offers/:id/respond',
      input: z.object({ status: z.enum(['accepted', 'rejected']) }),
      responses: {
        200: z.custom<typeof offers.$inferSelect>(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
