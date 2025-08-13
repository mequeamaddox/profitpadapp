# Overview

ProfitPad is a comprehensive business management application designed for online sellers and entrepreneurs. The application provides inventory tracking, sales recording, financial analytics, and task management capabilities. Built as a full-stack web application, it features a modern React frontend with a Node.js/Express backend, designed to help users maximize their business profitability through data-driven insights.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

Updated pricing model from free tier to paid plans with trial:
- Starter: $9.99/month - Up to 100 inventory items, complete sales tracking, essential analytics, task reminders, CSV import/export
- Professional: $19.99/month - Unlimited inventory/sales/reminders, advanced analytics, multi-platform integration  
- Enterprise: $49.99/month - All Professional features plus team access, API integrations, dedicated support

Implemented 3-day trial system for all plans:
- Trial (3 days): Full access to all features before requiring subscription
- No free tier - all plans require subscription after trial period

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

Implemented comprehensive Barcode Scanner system (January 2025):
- Real-time camera-based barcode scanning using @zxing/library and react-webcam
- Integration with inventory forms via scan button for seamless workflow
- Automatic inventory item lookup when scanning existing product barcodes
- Smart form pre-filling when matching items are found in inventory
- Enhanced search functionality to include barcode matching
- Added barcode field to inventory database schema and forms
- Mobile-friendly camera access with back camera support
- Visual scanning overlay with targeting lines for improved UX
- Error handling for camera permissions and scanning failures

Fixed Mobile Navigation Modal Scrolling Issues (January 2025):
- Resolved Android scrolling problems with navigation "Add New" button modal
- Implemented flexbox layout with proper container structure for mobile
- Added Business Expense form option to the add menu modal
- Fixed reminder form date validation errors causing crashes
- Removed test percentage data from dashboard metrics display
- Enhanced z-index handling to prevent mobile overlay conflicts
- Optimized mobile scrolling with webkit-overflow-scrolling and touch-action properties

Reorganized Pallets module integration (January 2025):
- Moved liquidation pallet COGS tracking from standalone page to inventory page tabs
- Implemented tabbed interface with "Inventory Items" and "Liquidation Pallets" sections
- Maintained full pallet functionality: creation, editing, deletion, cost allocation
- Updated navigation to remove standalone Pallets menu item
- Integrated pallet forms and management within inventory workflow
- Streamlined user experience by grouping related inventory functions together

Enhanced Pallet-Inventory Integration with Break-Even Analysis (January 2025):
- Implemented comprehensive break-even analysis with both overall and per-pallet tracking
- Added tabbed interface showing business-wide and individual pallet performance
- Integrated pallet selection field in inventory forms for cost allocation
- Created intelligent pallet break-even calculations using pallet totalItems and linked inventory
- Added user guidance tooltips for linking inventory items to pallets for sales tracking
- Fixed pallet data integration to show correct item counts and break-even progress

Converted to Progressive Web App (PWA) for private distribution (January 2025):
- Full PWA implementation with manifest.json and service worker for offline functionality
- Mobile-responsive design with collapsible navigation and touch-friendly interface
- App installation prompts for direct distribution without app stores (like Amazon Flex)
- Optimized mobile forms with proper touch targets and accessibility
- Private deployment options for controlled user access similar to enterprise apps
- Custom app icons and standalone mode for native app-like experience
- Installation shortcuts for common tasks (Add Inventory, Record Sale, View Reports)
- Deployment guide created with step-by-step instructions for private distribution
- Mobile-first responsive layout with hidden desktop sidebar on mobile devices
- Enhanced mobile navigation with slide-out menu and improved user experience

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