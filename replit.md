# Overview

ProfitPad is a comprehensive business management application designed for online sellers and entrepreneurs. The application provides inventory tracking, sales recording, financial analytics, and task management capabilities. Built as a full-stack web application, it features a modern React frontend with a Node.js/Express backend, designed to help users maximize their business profitability through data-driven insights.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

Updated pricing tiers to higher amounts:
- Professional: $19.99/month (was $9.99/month)  
- Enterprise: $49.99/month (was $29.99/month)

Implemented 3-day trial system replacing free tier:
- Trial (3 days): Full access to all features - unlimited inventory, sales, reminders, and advanced analytics
- Professional ($19.99/month): Unlimited inventory/sales/reminders, advanced analytics, multi-platform integration
- Enterprise ($49.99/month): All Professional features plus team access, API integrations, dedicated support

Trial expiration system implemented with middleware checking and trial expired prompts in forms.

Added comprehensive Reports section with:
- Key business metrics dashboard with revenue, profit, sales analytics
- Advanced filtering by date range, platform, and category
- Detailed sales analysis with top-selling items and recent transactions
- Inventory reporting with current stock status and valuation
- Platform performance comparison showing sales breakdown by selling platform
- Monthly trends analysis showing business performance over time
- Export functionality for CSV reports
- Interactive tabbed interface for different report types

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Chart.js integration for revenue analytics and dashboard visualizations

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for scalable cloud hosting
- **Session Management**: Express sessions with PostgreSQL store for persistence
- **Authentication**: OpenID Connect (OIDC) integration with Replit authentication

## Data Storage Solutions
- **Primary Database**: PostgreSQL with the following schema:
  - Users table with profile information and monthly goals
  - Inventory items with SKU tracking, pricing, and platform information
  - Sales records with profit calculations and buyer details
  - Reminders system for task management
  - Sessions table for authentication state
- **ORM**: Drizzle with schema validation using Zod for runtime type safety
- **File Storage**: Google Cloud Storage integration via @google-cloud/storage for image uploads
- **File Upload**: Uppy.js for drag-and-drop file uploads with AWS S3 compatibility

## Authentication and Authorization
- **Provider**: Replit OIDC integration for seamless authentication in the Replit environment
- **Session Management**: Secure HTTP-only cookies with PostgreSQL-backed session storage
- **Security**: CSRF protection through session-based authentication
- **User Management**: Automatic user creation and profile management from OIDC claims

## Design Patterns
- **Component Architecture**: Modular React components with clear separation of concerns
- **Data Layer**: Repository pattern implemented through storage abstraction layer
- **API Design**: RESTful endpoints with consistent error handling and response formatting
- **Type Safety**: End-to-end TypeScript with shared schema definitions between client and server
- **Form Management**: Declarative forms with schema validation and error handling
- **Query Management**: Optimistic updates and cache invalidation strategies

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## Authentication Services
- **Replit OIDC**: Identity provider integration for user authentication and profile management

## Cloud Storage
- **Google Cloud Storage**: File and image storage with CDN capabilities for inventory photos

## UI and Component Libraries
- **Radix UI**: Headless component primitives for accessibility-compliant interface elements
- **Shadcn/ui**: Pre-built component library built on Radix UI foundations
- **Lucide React**: Icon library for consistent iconography throughout the application

## Development and Build Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Type checking and compilation for both client and server code
- **TanStack Query**: Server state management with caching and synchronization
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration

## File Upload and Management
- **Uppy**: File upload library with multiple upload strategies (drag-drop, file input, dashboard)
- **AWS S3 compatibility**: For flexible file storage options beyond Google Cloud

## Analytics and Visualization
- **Chart.js**: Charting library for revenue trends and business analytics dashboards
- **React Chart.js 2**: React wrapper for Chart.js integration