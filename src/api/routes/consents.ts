import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { generateId, hashSha256 } from "../lib/utils";
import { consents as consentsTable, auditLog, activities } from "../schema";
import type { Env, AppVariables } from "..";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

app.use("*", authMiddleware);

// ── List consents ────────────────────────────────────────
app.get("/", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;
  const status = c.req.query("status");

  let query = db.select().from(consentsTable).where(eq(consentsTable.userId, auth.userId));

  if (status && status !== "all") {
    query = db
      .select()
      .from(consentsTable)
      .where(
        and(eq(consentsTable.userId, auth.userId), status !== "all" ? eq(consentsTable.status, status as "pending" | "active" | "revoked" | "expired") : undefined),
      );
  }

  const result = await query.orderBy(consentsTable.requestedAt);

  const items = result.map((row) => ({
    id: row.id,
    institution: row.institution,
    institutionType: row.institutionType,
    purpose: row.purpose,
    scope: JSON.parse(row.scopeJson),
    requestedAt: row.requestedAt,
    expiresAt: row.expiresAt,
    status: row.status,
    duration: row.duration,
  }));

  return c.json(items);
});

// ── Get consent by ID ────────────────────────────────────
app.get("/:id", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;
  const id = c.req.param("id");

  const consent = await db
    .select()
    .from(consentsTable)
    .where(and(eq(consentsTable.id, id), eq(consentsTable.userId, auth.userId)))
    .get();

  if (!consent) return c.json({ error: "Consent not found" }, 404);

  return c.json({
    id: consent.id,
    institution: consent.institution,
    institutionType: consent.institutionType,
    purpose: consent.purpose,
    scope: JSON.parse(consent.scopeJson),
    requestedAt: consent.requestedAt,
    expiresAt: consent.expiresAt,
    status: consent.status,
    duration: consent.duration,
  });
});

// ── Respond to consent ───────────────────────────────────
const respondSchema = z.object({
  action: z.enum(["approve", "reject", "revoke"]),
});

app.post("/:id/respond", zValidator("json", respondSchema), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;
  const id = c.req.param("id");
  const { action } = c.req.valid("json");

  const consent = await db
    .select()
    .from(consentsTable)
    .where(and(eq(consentsTable.id, id), eq(consentsTable.userId, auth.userId)))
    .get();

  if (!consent) return c.json({ error: "Consent not found" }, 404);

  const newStatus = action === "approve" ? "active" : action === "reject" ? "revoked" : "revoked";

  await db
    .update(consentsTable)
    .set({ status: newStatus, respondedAt: new Date().toISOString() })
    .where(eq(consentsTable.id, id));

  await db.insert(auditLog).values({
    id: generateId("aud"),
    userId: auth.userId,
    actor: auth.name,
    action: newStatus === "active" ? "consent.granted" : "consent.revoked",
    resource: id,
    hash: await hashSha256(`${id}:${action}:${Date.now()}`),
    ip: c.req.header("CF-Connecting-IP") || "unknown",
  });

  return c.json({
    id: consent.id,
    institution: consent.institution,
    institutionType: consent.institutionType,
    purpose: consent.purpose,
    scope: JSON.parse(consent.scopeJson),
    requestedAt: consent.requestedAt,
    expiresAt: consent.expiresAt,
    status: newStatus,
    duration: consent.duration,
  });
});

export default app;
