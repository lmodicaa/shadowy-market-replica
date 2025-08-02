# Replit Project Summary

## Overview
This project is a full-stack JavaScript web application with a space/astronomy theme, migrated from Lovable to Replit. It features user authentication, a comprehensive plan subscription and management system, a VM dashboard, and an extensive admin panel. The application aims to provide a robust platform for managing user subscriptions and virtual machine resources.

## User Preferences
- Language: Portuguese (Brazilian Portuguese) - converted from Spanish
- Authentication: Supabase integration preferred
- Styling: Space/astronomy theme with animated backgrounds

## System Architecture
The application is built with a React frontend using TypeScript and wouter for routing, an Express.js backend with TypeScript, and Supabase for its PostgreSQL database and authentication. Tailwind CSS with shadcn/ui components is used for styling, featuring a custom space theme. Vite is employed as the build tool.

Key architectural decisions and features include:
- **Frontend**: React.js with TypeScript, `wouter` for client-side routing.
- **Backend**: Express.js server in TypeScript for API endpoints.
- **Database**: Supabase PostgreSQL for data storage, including user profiles, plans, subscriptions, and payment orders.
- **Authentication**: Supabase handles user authentication, integrated with Discord OAuth.
- **Styling**: Tailwind CSS for utility-first styling, complemented by `shadcn/ui` components. Custom space-themed design, including StarField background animations.
- **Core Functionality**:
    - **Plans System**: Interactive subscription tiers with technical specifications (RAM, CPU, Storage, GPU, Resolution, Duration). Supports manual PIX payment processing with QR code/text key display and admin review workflow for payment proof.
    - **VM Dashboard**: Displays plan-based specifications and simulated machine control.
    - **User Management**: User profiles, subscription history, and plan status tracking.
    - **Admin Panel**: Comprehensive interface for user management, plan stock control, system settings (e.g., maintenance mode, registration blocking), PIX order management with payment proof review, and statistics (revenue, user analytics).
- **Environment Management**: Intelligent detection for development (Replit, localhost) and production (`matecloud.store`) environments for API calls and Supabase integration.
- **Performance & Optimization**: Implemented image optimization (WebP/AVIF with fallbacks), lazy loading, font optimization, and various Lighthouse recommendations.
- **Security**: Client/server separation, environment variable configuration, and Supabase Row Level Security (RLS) policies.

## External Dependencies
- **Supabase**: PostgreSQL database, Authentication (with Discord OAuth), Supabase Storage.
- **React**: Frontend UI library.
- **Express.js**: Backend web application framework.
- **wouter**: Fast and lightweight React router.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Reusable UI components.
- **Vite**: Next-generation frontend tooling.
- **TypeScript**: Superset of JavaScript for type-safety.
- **Font Awesome**: Icon library.
- **Sonner**: Toast notification library.