-- Initial database setup for Aim Trainer
-- This file is executed when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created after Prisma migrations

-- Sample achievements data
-- This will be inserted after tables are created 