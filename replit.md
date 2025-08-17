# Q&A Application

## Project Overview
A full-stack Q&A application built with Express.js backend and React frontend. Users can ask questions, view questions, and see detailed question pages.

## Recent Changes
- August 17, 2025: Implemented three-tier role system (Admin, Supervisor, User)
- Migrated from Replit Auth to local authentication system with login/logout
- Added approval workflow for supervisor-created content
- Users can only view questions and raise issues (no answers)
- Supervisors can post questions and answers (pending admin approval)
- Admins have full access to everything plus approval powers
- Added dedicated user accounts: admin@company.com, supervisor@company.com, user@company.com (password: password123)

## Tech Stack
- **Backend**: Express.js with TypeScript and Replit Auth
- **Frontend**: React with Vite
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Local authentication with role-based access control
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing

## Project Architecture
- `server/`: Express backend with API routes, database models, and Vite integration
- `client/`: React frontend with pages, components, and utilities
- `shared/`: Shared TypeScript schemas between frontend and backend
- Database uses SQLite for local development with proper seed data

## User Preferences
- Three-tier role system: Admin (full access), Supervisor (post with approval), User (view + raise issues only)
- No signup functionality - users are added directly to database
- Admin pages accessible only via direct URL routes (e.g., /admin) with no visible buttons or links  
- Users have different interfaces based on role permissions
- Authentication uses local login system only

## Development Notes
- Server runs on port 5000 and serves both API and frontend
- Uses `0.0.0.0` for accessible port bindings
- Database seeds automatically on startup if empty
- Cross-env package properly installed for environment variable handling