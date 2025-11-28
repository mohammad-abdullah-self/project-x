import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./server/db/migrations-tenant",
  schema: "./server/db/schema_tenant.ts",
  dialect: "postgresql",
});
