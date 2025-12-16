/**
 * Database Connection and Client
 * Using Drizzle ORM with PostgreSQL (postgres.js driver)
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres.js client
// For connection pooling in production, consider using pgBouncer
const client = postgres(connectionString, {
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements for serverless environments
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export * from './schema';

// Type for the database instance
export type Database = typeof db;
