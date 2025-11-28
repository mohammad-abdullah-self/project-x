/* server/api/register.post.ts */
import { defineEventHandler, readBody, createError } from "h3";

// Adjust imports
import { tenantsTable, usersTable } from "../db/schema";
import { usersTable as tenantUsersTable } from "../db/schema_tenant";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const systemPool = getSystemPool();
  const systemDb = getSystemDb();

  // const body = await readBody(event);
  const name = "Beta Company";
  const subdomain = "beta";

  if (!name || !subdomain) {
    throw createError({
      statusCode: 400,
      statusMessage: "name and tenant required",
    });
  }

  // 1) Generate safe DB name
  const safeSub = subdomain.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  // const suffix = Date.now();
  const tenantDbName = `tenant_${safeSub}`;

  const tenantDbUrl = `${runtimeConfig.db.tenantDbUrl}/${tenantDbName}`;

  let createdDb = false;

  // 2) Create tenant DB
  const adminClient = await systemPool.connect();
  try {
    await adminClient.query(`CREATE DATABASE "${tenantDbName}"`);
    createdDb = true;
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create tenant DB: " + (err as Error).message,
    });
  } finally {
    adminClient.release();
  }

  // 4) Insert tenant metadata

  const [tenantData] = await systemDb
    .insert(tenantsTable)
    .values({
      tenant: subdomain,
      name: tenantDbName,
      dbUrl: tenantDbUrl,
    })
    .returning();

  // 5) Seed tenant user

  // 6) Optional: insert system user linked to tenant
  const [systemUser] = await systemDb
    .insert(usersTable)
    .values({
      name: "Beta User",
      age: 30,
      email: "beta@tenant.com",
    })
    .returning();

  // 3) Run migrations
  const tenantDb = getOrCreateTenantDb(tenantDbUrl);

  try {
    const migrationsDir = path.resolve(
      process.cwd(),
      "server",
      "db",
      "migrations-tenant"
    );

    // read migration files into memory (this builds the journal metadata)
    // const migrations = await readMigrationFiles(migrationsDir);

    // run the migrator with the read migrations
    await migrate(tenantDb, { migrationsFolder: migrationsDir });
    await tenantDb.insert(tenantUsersTable).values({
      name: "Beta User",
      age: 30,
      email: "beta@tenant.com",
    });
  } catch (err) {
    // Clean up DB if migration fails
    if (createdDb) {
      await systemPool.query(`DROP DATABASE IF EXISTS "${tenantDbName}"`);
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Tenant migrations failed: " + (err as Error).message,
    });
  } finally {
    closeAllTenantPools();
  }

  return { status: 201, tenant: tenantData, systemUser };
});
