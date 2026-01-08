# Lotty - Land Marketplace for Paraguay

## Overview

Lotty is a full-stack web application serving as a marketplace/classified ads platform exclusively for land and lots in Paraguay. The platform allows users to browse, list, and manage land listings with a subscription-based publishing model. The application features user authentication, listing management, real-time chat between buyers and sellers, and an admin dashboard for moderation and plan management.

Key business features:
- Subscription plans (free trial, monthly, annual) that users need to publish listings
- Listing moderation workflow (pending → active/rejected)
- Automatic archiving of listings when subscriptions expire
- Chat system for buyer-seller communication
- Admin dashboard for user management and statistics

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with custom theme configuration, Montserrat as the primary font
- **Form Handling**: React Hook Form with Zod validation

The frontend lives in `/client` directory with:
- `/client/src/pages/` - Page components (Home, Listings, Dashboard, Auth, etc.)
- `/client/src/components/` - Reusable components including shadcn/ui components
- `/client/src/hooks/` - Custom hooks for authentication, listings, chats, admin features

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **File Uploads**: Multer for handling image uploads (stored in `/uploads` directory)
- **Password Hashing**: bcryptjs for secure password storage

The backend lives in `/server` directory with:
- `/server/routes.ts` - API route definitions and handlers
- `/server/storage.ts` - Database access layer (repository pattern)
- `/server/db.ts` - Database connection setup

### Shared Code
- `/shared/schema.ts` - Drizzle database schema definitions with Zod validation schemas
- `/shared/routes.ts` - API route type definitions for type-safe client-server communication

### Database Schema
Core tables include:
- `users` - User accounts with role-based access (user/admin)
- `subscriptions` - User subscription plans with status and expiration
- `listings` - Land listings with detailed property information
- `listing_images` - Images associated with listings
- `chats` - Chat sessions between buyers and sellers
- `messages` - Individual chat messages
- `offers` - Purchase offers on listings

### Authentication
- Cookie-based session authentication (no JWT)
- Sessions stored in PostgreSQL using connect-pg-simple
- Role-based authorization (user vs admin)
- Protected routes validated on both client and server

### Build System
- Development: Vite dev server with HMR, proxying API requests to Express
- Production: Vite builds static assets to `/dist/public`, esbuild bundles server to `/dist/index.cjs`
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe database access
- connect-pg-simple for session storage

### File Storage
- Local file system storage in `/uploads` directory
- Multer middleware for multipart form handling
- Supports JPG, PNG, WEBP images up to 5MB

### UI/Styling Dependencies
- Google Fonts (Montserrat) loaded via CDN
- Radix UI primitives for accessible component foundations
- Lucide React for icons
- date-fns for date formatting

### Development Tools
- TypeScript for type safety across the stack
- Vite plugins for Replit integration (error overlay, cartographer, dev banner)

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - Environment mode (development/production)