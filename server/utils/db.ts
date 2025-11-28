import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "~~/server/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
});

export const db = drizzle({
  client: pool,
  //   schema,
});

// export const db = defineEventHandler(async (event) => {
//   const runtimeConfig = useRuntimeConfig(event);
//   try {
//     const pool = new Pool({
//       connectionString: runtimeConfig.databaseUrl,
//       max: 10,
//     });

//     const db = drizzle({
//       client: pool,
//       schema,
//     });
//     return db;
//   } catch (err) {
//     console.log(err);

//     return { err };
//   }
// });
