import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "../schema";

export function getDb(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
