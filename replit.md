# Project Migration from Lovable to Replit

## Overview
This is a full-stack JavaScript application that has been migrated from Lovable to the Replit environment. The project appears to be a web application with space/astronomy theming, featuring user authentication via Supabase, navigation, hero sections, features, and tutorials.

## Project Architecture
- **Frontend**: React with TypeScript, using wouter for routing (converted from React Router)
- **Backend**: Express.js server with TypeScript
- **Database**: Supabase PostgreSQL (using existing user database with SupabaseStorage)
- **Authentication**: Supabase authentication integration with Discord OAuth
- **Styling**: Tailwind CSS with shadcn/ui components and custom space theme
- **Build Tool**: Vite with custom server setup

## Current Status
- [x] Dependencies installed (react-router-dom, @fortawesome packages, sonner, @supabase/supabase-js)
- [x] Project structure adapted for Replit compatibility
- [x] Routing system converted from React Router to wouter
- [x] Environment variables and Supabase integration secured
- [x] Application tested and verified working
- [x] Translation from Spanish to Brazilian Portuguese completed
- [x] Plans section implemented with functional navigation
- [x] Database schema integration with Supabase tables
- [x] VM Dashboard with plan-based specifications
- [x] Plan subscription and management system
- [x] User profile with subscription history
- [x] Admin panel with user management, plan stock control, and system settings
- [x] Complete admin interface with statistics and configuration options

## Key Components
- StarField background animation
- Navigation with authentication state and smooth scroll
- Hero, Features, Plans, and Tutorials sections
- User authentication flow with Supabase
- Interactive Plans section with 3 subscription tiers
- VM Dashboard with machine control and specifications
- User Plan Status tracking with expiration monitoring
- Subscription history and plan management system
- Comprehensive Admin Panel with user management, plan stock control
- Administrative settings for system configuration
- Statistics dashboard with revenue tracking and user analytics
- Admin user privileges and permission system

## Security Considerations
- Client/server separation maintained
- Environment variables properly configured for frontend (VITE_ prefix)
- Authentication handled securely through Supabase

## Recent Changes
- 2025-01-20: Completed migration from Replit Agent to Replit environment
- 2025-01-20: Implemented maintenance mode functionality with admin controls
- 2025-01-20: Fixed admin settings upsert functionality to prevent duplicate key errors
- 2025-01-20: Added automatic initialization of default admin settings
- 2025-01-20: Created MaintenanceMode component for non-admin users during maintenance
- Configuración completa del panel administrativo en portugués brasileño
- Added Supabase environment variables for authentication
- Translated all Spanish content to Brazilian Portuguese
- Updated user interface language across all components (Profile, Settings, Navigation)
- Updated locale formatting for dates and times to Portuguese (pt-BR)
- Updated comments and console messages to Portuguese
- Verified application functionality with authentication working properly
- Added comprehensive Plans section with 3 subscription tiers (Básico, Gamer, Pro)
- Implemented smooth scroll navigation between sections (Início, Planos, FAQ, Tutoriais)
- Added functional "Ver planos" button with smooth scrolling behavior
- Created interactive plan selection with pricing and feature comparison
- Integrated Supabase database schema with profiles, plans, and subscriptions tables
- Implemented user profile management with plan status tracking
- Added VM Dashboard with simulated machine management (start/stop/specs)
- Created subscription history tracking and plan expiration monitoring
- Added real-time plan status with days remaining calculation
- Implemented complete admin panel with user management, plan stock control, system settings
- Added admin authentication and permission system with protected routes
- Created comprehensive admin dashboard with statistics, revenue tracking, and system health
- Implemented plan stock management with availability controls and low stock alerts

## User Preferences
- Language: Portuguese (Brazilian Portuguese) - converted from Spanish
- Authentication: Supabase integration preferred
- Styling: Space/astronomy theme with animated backgrounds