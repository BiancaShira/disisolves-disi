# Q&A Application

## Project Overview
A full-stack Q&A application built with Express.js backend and React frontend. Users can ask questions, view questions, and see detailed question pages.

## Recent Changes
- July 23, 2025: Migrated from Replit Agent to Replit environment with PostgreSQL database
- Added Replit Auth authentication system with admin/user role management
- Created admin dashboard accessible only via direct URL (/admin) with no visible links
- Implemented comprehensive API routes with authentication middleware
- Added public folder for image storage and static file serving

## Tech Stack
- **Backend**: Express.js with TypeScript and Replit Auth
- **Frontend**: React with Vite
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing

## Project Architecture
- `server/`: Express backend with API routes, database models, and Vite integration
- `client/`: React frontend with pages, components, and utilities
- `shared/`: Shared TypeScript schemas between frontend and backend
- Database uses SQLite for local development with proper seed data

## User Preferences
- Admin pages should be accessible only via direct URL routes (e.g., /admin) with no visible buttons or links
- Landing page should remain unchanged for non-authenticated users
- Authentication system should use role-based access (admin vs regular users)

## Development Notes
- Server runs on port 5000 and serves both API and frontend
- Uses `0.0.0.0` for accessible port bindings
- Database seeds automatically on startup if empty
- Cross-env package properly installed for environment variable handling