import "dotenv/config";
import { sql } from "drizzle-orm";
import { usersTable } from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
// ESM faker
import { faker } from "@faker-js/faker";

type UserInsert = {
  name: string;
  email: string;
  age: number;
};

function* createRandomUniqueUser(
  count: number = 100,
  globalEmails?: Set<string>
) {
  const emails = globalEmails ?? new Set<string>();
  let generated = 0;

  while (generated < count) {
    const email = faker.internet.email().toLowerCase();

    // ensure global uniqueness if a Set is passed in (or local uniqueness otherwise)
    if (emails.has(email)) continue;

    emails.add(email);
    generated++;

    yield {
      name: faker.person.fullName(),
      email,
      age: faker.number.int({ max: 100 }),
    } as UserInsert;
  }
}

/**
 * Drain generator into chunked arrays and call handler on each chunk.
 * This avoids building a huge array in memory.
 */
async function forEachChunk<T>(
  gen: Generator<T>,
  chunkSize: number,
  handler: (chunk: T[], chunkIndex: number) => Promise<void>
) {
  let chunk: T[] = [];
  let count = 0;
  let chunkIndex = 0;

  for (const item of gen) {
    chunk.push(item);
    count++;

    if (chunk.length >= chunkSize) {
      await handler(chunk, chunkIndex++);
      chunk = [];
    }
  }

  if (chunk.length > 0) {
    await handler(chunk, chunkIndex);
  }

  return count;
}

async function main() {
  const DB_URL = process.env.NUXT_SYSTEM_DB_URL;
  if (!DB_URL) {
    console.error("NUXT_SYSTEM_DB_URL is not set");
    process.exit(1);
  }

  console.log("🌱 Seeding database...");
  const db = drizzle(DB_URL, { schema });

  // truncate table first
  await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
  console.log("Truncated users table.");

  // config
  const TOTAL = 100_000; // total users you want
  const CHUNK_SIZE = 5_000; // number of users per insert (tune for memory / DB)

  // keep global set so duplicates never appear across chunks
  const globalEmails = new Set<string>();

  // create a generator that will yield TOTAL users, using the shared email set
  const gen = createRandomUniqueUser(TOTAL, globalEmails);

  let inserted = 0;
  let chunkCount = 0;

  try {
    await forEachChunk<UserInsert>(gen, CHUNK_SIZE, async (chunk, idx) => {
      // chunk is an array of UserInsert
      // Insert the chunk. Drizzle will automatically generate a multi-row insert.
      await db.insert(usersTable).values(chunk);
      inserted += chunk.length;
      chunkCount = idx + 1;

      console.log(
        `Inserted chunk ${idx + 1} — ${
          chunk.length
        } users (total inserted: ${inserted})`
      );
    });

    console.log(`✅ Done: inserted ${inserted} users in ${chunkCount} chunks.`);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }

  // exit gracefully
  process.exit(0);
}

main();
