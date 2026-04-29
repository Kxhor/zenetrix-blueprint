import { Hono } from "hono";
import { desc } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";
import { auditLog as auditTable } from "../schema";
import type { Db } from "../lib/db";

const app = new Hono<{
  Bindings: { DB: D1Database; JWT_SECRET: string };
  Variables: { db: Db; auth: { userId: string; role: "user" | "admin"; name: string } };
}>();

app.get("/", authMiddleware, requireRole("admin"), async (c) => {
  const db = c.get("db");

  const rows = await db.select().from(auditTable).orderBy(desc(auditTable.at)).limit(100);

  const entries = rows.map((row) => ({
    id: row.id,
    at: row.at,
    actor: row.actor,
    action: row.action,
    resource: row.resource,
    hash: row.hash,
    ip: row.ip,
  }));

  return c.json(entries);
});

export default app;
