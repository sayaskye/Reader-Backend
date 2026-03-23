# Reader Backend

Backend service for the Reader application. It provides a RESTful API for e-book management, user authentication, and data synchronization.

## Overview

This project is built using Bun as the runtime and Hono as the web framework. It utilizes Drizzle ORM to interface with a PostgreSQL database and integrates with Supabase for data and storage services.

## Core Technologies

- Runtime: Bun
- Web Framework: Hono
- Database ORM: Drizzle ORM
- Database: PostgreSQL (Supabase)
- Validation: Zod
- Authentication: JWT (jose) and Argon2
- Image Processing: Sharp
- File Handling: JSZip and xml2js (for EPUB parsing)
- Middleware: CORS, Logger, Rate Limiter

## Prerequisites

- Bun runtime installed
- A PostgreSQL database instance (preferably Supabase)

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Environment Configuration:
   Create a `.env` file in the root directory and configure the following variables based on `.env.example`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Database Schema:
   Use Drizzle Kit to manage the database schema:

   ```bash
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

4. Run the development server:
   ```bash
   bun dev
   ```

The API will be available at `http://localhost:8000/api/` by default.

## Available Scripts

- `bun dev`: Starts the development server with hot reloading.
- `bun start`: Runs the application in production mode.
- `bun build`: Placeholder for build steps (currently not required for Bun).

## Features

- RESTful routes for books, users, and roles.
- Automatic EPUB metadata extraction and parsing.
- Secure authentication using Argon2 hashing and JWTs.
- Role-based access control (RBAC).
- Specialized middlewares for rate limiting and concurrency management during file uploads.
- Centralized error handling and logging.

## Repository Information

This repository is focused on the development of the EpubReader backend. This project is not intended for public distribution or open-source contribution at this stage.

Frontend Repository: https://github.com/sayaskye/Reader-Frontend
