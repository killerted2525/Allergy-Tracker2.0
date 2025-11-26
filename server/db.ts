import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Only set websocket constructor in development
if (process.env.NODE_ENV !== 'production') {
  neonConfig.webSocketConstructor = ws;
}

// Configure pool with better serverless settings (only if DATABASE_URL exists)
let pool: Pool | null = null;
let dbClient: any = null;

if (process.env.DATABASE_URL) {
  try {
    console.log("Connecting to database...");
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      max: 1,
    });

    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });

    dbClient = drizzle({ client: pool, schema });
    console.log("Database connection established");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    pool = null;
    dbClient = null;
  }
} else {
  console.warn("DATABASE_URL not set. App will use in-memory storage.");
}

export const db = dbClient;
export { pool };