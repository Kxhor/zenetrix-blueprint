import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";
import { generateId, hashSha256 } from "../lib/utils";
import { credentials as credentialsTable, auditLog } from "../schema";
import type { Env, AppVariables } from "..";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// All routes require auth
app.use("*", authMiddleware);

// ── List credentials ─────────────────────────────
app.get("/", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;

  const result =
    auth.role === "admin"
      ? await db.select().from(credentialsTable).orderBy(credentialsTable.createdAt)
      : await db
          .select()
          .from(credentialsTable)
          .where(eq(credentialsTable.userId, auth.userId))
          .orderBy(credentialsTable.createdAt);

  const items = result.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    issuer: row.issuer,
    issuedAt: row.issuedAt,
    expiresAt: row.expiresAt,
    status: row.status,
    serial: row.serial,
    claims: JSON.parse(row.claimsJson),
  }));

  return c.json(items);
});

// ── Get credential by ID ─────────────────────────────────
app.get("/:id", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;
  const id = c.req.param("id");

  const cred =
    auth.role === "admin"
      ? await db.select().from(credentialsTable).where(eq(credentialsTable.id, id)).get()
      : await db
          .select()
          .from(credentialsTable)
          .where(and(eq(credentialsTable.id, id), eq(credentialsTable.userId, auth.userId)))
          .get();

  if (!cred) return c.json({ error: "Credential not found" }, 404);

  return c.json({
    id: cred.id,
    type: cred.type,
    title: cred.title,
    issuer: cred.issuer,
    issuedAt: cred.issuedAt,
    expiresAt: cred.expiresAt,
    status: cred.status,
    serial: cred.serial,
    claims: JSON.parse(cred.claimsJson),
  });
});

// ── Revoke credential ────────────────────────────────────
const revokeSchema = z.object({ reason: z.string().optional() });

app.post("/:id/revoke", zValidator("json", revokeSchema), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;
  const id = c.req.param("id");

  const cred =
    auth.role === "admin"
      ? await db.select().from(credentialsTable).where(eq(credentialsTable.id, id)).get()
      : await db
          .select()
          .from(credentialsTable)
          .where(and(eq(credentialsTable.id, id), eq(credentialsTable.userId, auth.userId)))
          .get();

  if (!cred) return c.json({ error: "Credential not found" }, 404);
  if (cred.status === "revoked") return c.json({ error: "Already revoked" }, 400);

  await db.update(credentialsTable).set({ status: "revoked" }).where(eq(credentialsTable.id, id));

  await db.insert(auditLog).values({
    id: generateId("aud"),
    userId: auth.userId,
    actor: auth.name,
    action: "credential.revoked",
    resource: id,
    hash: await hashSha256(`${id}:revoked:${Date.now()}`),
    ip: c.req.header("CF-Connecting-IP") || "unknown",
  });

  return c.json({
    id: cred.id,
    type: cred.type,
    title: cred.title,
    issuer: cred.issuer,
    issuedAt: cred.issuedAt,
    expiresAt: cred.expiresAt,
    status: "revoked",
    serial: cred.serial,
    claims: JSON.parse(cred.claimsJson),
  });
});

export default app;
