# Q&A Application

## Project Overview
A full-stack Q&A application built with Express.js backend and React frontend. Users can ask questions, view questions, and see detailed question pages.

## Recent Changes
- July 23, 2025: Migrated from Replit Agent to Replit environment
- Verified server startup and database initialization working properly

## Tech Stack
- **Backend**: Express.js with TypeScript
- **Frontend**: React with Vite
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing

## Project Architecture
- `server/`: Express backend with API routes, database models, and Vite integration
- `client/`: React frontend with pages, components, and utilities
- `shared/`: Shared TypeScript schemas between frontend and backend
- Database uses SQLite for local development with proper seed data

## User Preferences
- No specific user preferences documented yet

## Development Notes
- Server runs on port 5000 and serves both API and frontend
- Uses `0.0.0.0` for accessible port bindings
- Database seeds automatically on startup if empty
- Cross-env package properly installed for environment variable handling