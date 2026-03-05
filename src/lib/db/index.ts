import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const pool =
  databaseUrl != null && databaseUrl.length > 0
    ? new Pool({
        connectionString: databaseUrl,
      })
    : undefined;

export const db = pool ? drizzle(pool, { schema }) : undefined;
export * from "./schema";

