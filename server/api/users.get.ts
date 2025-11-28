import { defineEventHandler } from "h3";
import { usersTable } from "../db/schema_tenant";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const tenantId = (event as any).context.tenantId;
  const tenantDbName = `tenant_${tenantId}`;

  const tenantDbUrl = `${runtimeConfig.db.tenantDbUrl}/${tenantDbName}`;
  const db = getOrCreateTenantDb(tenantDbUrl);
  // run queries via Drizzle
  const users = await db.select().from(usersTable);
  return users;
});
