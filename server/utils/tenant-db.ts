import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "~~/server/db/schema_tenant";

type CacheEntry = {
  pool: Pool;
  db: ReturnType<typeof drizzle>;
};

const cache = new Map<string, CacheEntry>();

export function getOrCreateTenantDb(dbUrl: string) {
  const key = dbUrl;
  if (cache.has(key)) return cache.get(key)!.db;

  const pool = new Pool({
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    allowExitOnIdle: true, // helpful for serverless or graceful shutdown
  });

  const db = drizzle({ client: pool, schema });
  cache.set(key, { pool, db });

  return db;
}

export function closeAllTenantPools() {
  for (const e of cache.values()) e.pool.end().catch(() => {});
  cache.clear();
}
