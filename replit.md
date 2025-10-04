# Overview

ProfitPad is a comprehensive business management application for online sellers, offering inventory tracking, sales recording, financial analytics, and task management. This full-stack web application, built with React and Node.js/Express, aims to maximize business profitability through data-driven insights. It includes a subscription model (Starter, Professional, Enterprise plans) with a 3-day trial period, and is designed to function as a Progressive Web App (PWA) for private distribution.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite.
- **UI Library**: Shadcn/ui components built on Radix UI primitives.
- **Styling**: Tailwind CSS with custom design tokens.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter for client-side routing.
- **Forms**: React Hook Form with Zod validation.
- **Charts**: Chart.js for analytics visualizations.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon serverless PostgreSQL.
- **Session Management**: Express sessions with PostgreSQL store.
- **Authentication**: OpenID Connect (OIDC) integration with Replit authentication.

## Data Storage Solutions
- **Primary Database**: PostgreSQL storing users, inventory, sales, reminders, and sessions.
- **ORM**: Drizzle with Zod for schema validation.
- **File Storage**: Google Cloud Storage via `@google-cloud/storage` for image uploads.
- **File Upload**: Uppy.js for drag-and-drop.

## Authentication and Authorization
- **Provider**: Replit OIDC.
- **Session Management**: Secure HTTP-only cookies with PostgreSQL-backed storage.
- **Security**: CSRF protection.
- **User Management**: Automatic creation from OIDC claims.

## Design Patterns
- **Component Architecture**: Modular React components.
- **Data Layer**: Repository pattern.
- **API Design**: RESTful endpoints.
- **Type Safety**: End-to-end TypeScript with shared schemas.
- **Form Management**: Declarative forms with schema validation.
- **Query Management**: Optimistic updates and cache invalidation.

## Key Features & Implementations
- **Inventory Management**: Detailed tool-based SKU system with pallet tracking, comprehensive inventory status management (unlisted/listed/sold/returned), and break-even analysis per pallet.
- **Dashboard**: Enhanced animated loading states with smooth transitions and interactive elements.
- **Reports**: Comprehensive section for key business metrics, sales analysis, inventory reporting, platform comparison, monthly trends, and CSV export. Includes dedicated "Tax Reports" tab.
- **Barcode Scanner**: Real-time camera-based scanning using QuaggaJS with universal product database lookup (UPCItemDB, Barcode Lookup, Go-UPC) for auto-populating inventory forms.
- **Mobile PWA**: Full Progressive Web App implementation with `manifest.json` and service worker for offline functionality, mobile-responsive design, and private distribution capabilities.
- **Tax Management**: Refactored to separate tax reporting from daily expense entry, focusing on deductible expense tracking.

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting.
- **Drizzle Kit**: Database migration and schema management.

## Authentication Services
- **Replit OIDC**: Identity provider.

## Cloud Storage
- **Google Cloud Storage**: File and image storage.

## UI and Component Libraries
- **Radix UI**: Headless component primitives.
- **Shadcn/ui**: Pre-built component library.
- **Lucide React**: Icon library.

## Development and Build Tools
- **Vite**: Build tool.
- **TypeScript**: Type checking and compilation.
- **TanStack Query**: Server state management.
- **Tailwind CSS**: Utility-first CSS framework.

## File Upload and Management
- **Uppy**: File upload library.
- **AWS S3 compatibility**: For flexible file storage.

## Analytics and Visualization
- **Chart.js**: Charting library.
- **React Chart.js 2**: React wrapper for Chart.js.

## Barcode Scanning
- **QuaggaJS**: Real-time camera-based barcode scanning.
- **UPCItemDB, Barcode Lookup, Go-UPC**: Product database APIs for universal lookup.