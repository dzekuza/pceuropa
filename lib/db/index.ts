// lib/db/index.ts — Drizzle Postgres client for the self-hosted database
// SERVER ONLY — never import in Client Components. Uses the node-postgres
// driver, so anything importing this file transitively pulls in Node
// built-ins (net, tls) and cannot run on the Edge runtime.
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";

// One pool per server process. Next.js dev server module-reloads on file
// changes, so stash the pool on globalThis to avoid exhausting connections.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema });
