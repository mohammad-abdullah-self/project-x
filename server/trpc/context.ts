// server/trpc/context.ts
import { H3Event } from "h3";

export const createTRPCContext = async (event: H3Event) => {
  const runtimeConfig = useRuntimeConfig(event);
  // const tenantId = (event as any).context.tenantId;
  // const tenantDbName = `tenant_${tenantId}`;

  // const tenantDbUrl = `${runtimeConfig.db.tenantDbUrl}/${tenantDbName}`;
  // const db = getOrCreateTenantDb(runtimeConfig.db.tenantDbUrl);
  const db = getSystemDb();
  return { db };
};

export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;
