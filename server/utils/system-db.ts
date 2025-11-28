import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "~~/server/db/schema";

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getSystemPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.NUXT_SYSTEM_DB_URL,
      max: 5,
    });
  }
  return pool;
}

export function getSystemDb() {
  if (!db) {
    db = drizzle({ client: getSystemPool(), schema });
  }
  return db;
}
