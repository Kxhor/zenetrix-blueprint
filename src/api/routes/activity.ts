import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { activities as activitiesTable } from "../schema";
import type { Db } from "../lib/db";

const app = new Hono<{
  Bindings: { DB: D1Database; JWT_SECRET: string };
  Variables: { db: Db; auth: { userId: string; role: "user" | "admin"; name: string } };
}>();

app.get("/", authMiddleware, async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");

  const rows = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.userId, auth.userId))
    .orderBy(desc(activitiesTable.at))
    .limit(50);

  const items = rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    at: row.at,
  }));

  return c.json(items);
});

export default app;
