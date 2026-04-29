import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, count, sql as drizzleSql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";
import { generateId, hashSha256 } from "../lib/utils";
import { sessions as sessionsTable, auditLog } from "../schema";
import type { Env, AppVariables } from "..";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// ── List sessions (admin) ────────────────────────────────
app.get("/", authMiddleware, requireRole("admin"), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;

  const status = c.req.query("status");
  const risk = c.req.query("risk");
  const q = c.req.query("q");
  const page = parseInt(c.req.query("page") || "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") || "10", 10);

  let whereClause = drizzleSql`1=1`;

  if (status && status !== "all") {
    whereClause = drizzleSql`${whereClause} AND ${sessionsTable.status} = ${status}`;
  }
  if (risk && risk !== "all") {
    if (risk === "low") {
      whereClause = drizzleSql`${whereClause} AND ${sessionsTable.riskScore} < 30`;
    } else if (risk === "medium") {
      whereClause = drizzleSql`${whereClause} AND ${sessionsTable.riskScore} >= 30 AND ${sessionsTable.riskScore} < 70`;
    } else {
      whereClause = drizzleSql`${whereClause} AND ${sessionsTable.riskScore} >= 70`;
    }
  }
  if (q) {
    whereClause = drizzleSql`${whereClause} AND (${sessionsTable.applicantName} LIKE ${`%${q}%`} OR ${sessionsTable.id} LIKE ${`%${q}%`} OR ${sessionsTable.documentNumber} LIKE ${`%${q}%`})`;
  }

  const totalResult = await db
    .select({ count: count() })
    .from(sessionsTable)
    .where(whereClause)
    .get();

  const total = totalResult?.count || 0;
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(sessionsTable)
    .where(whereClause)
    .orderBy(desc(sessionsTable.submittedAt))
    .limit(pageSize)
    .offset(offset);

  const items = rows.map((row) => ({
    id: row.id,
    applicantName: row.applicantName,
    applicantPhone: row.applicantPhone,
    applicantEmail: row.applicantEmail,
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    riskScore: row.riskScore,
    status: row.status,
    submittedAt: row.submittedAt,
    livenessScore: row.livenessScore,
    faceMatchScore: row.faceMatchScore,
    flags: JSON.parse(row.flagsJson),
    channel: row.channel,
    reviewer: row.reviewer,
    notes: row.notes,
  }));

  return c.json({ rows: items, total });
});

// ── Get session (admin) ──────────────────────────────────
app.get("/:id", authMiddleware, requireRole("admin"), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth")!;
  const id = c.req.param("id");

  const session = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).get();

  if (!session) return c.json({ error: "Session not found" }, 404);

  return c.json({
    id: session.id,
    applicantName: session.applicantName,
    applicantPhone: session.applicantPhone,
    applicantEmail: session.applicantEmail,
    documentType: session.documentType,
    documentNumber: session.documentNumber,
    riskScore: session.riskScore,
    status: session.status,
    submittedAt: session.submittedAt,
    livenessScore: session.livenessScore,
    faceMatchScore: session.faceMatchScore,
    flags: JSON.parse(session.flagsJson),
    channel: session.channel,
    reviewer: session.reviewer,
    notes: session.notes,
  });
});

// ── Decide session (admin) ───────────────────────────────
const decideSchema = z.object({
  decision: z.enum(["approve", "reject", "escalate"]),
  note: z.string().optional(),
});

app.post(
  "/:id/decide",
  zValidator("json", decideSchema),
  authMiddleware,
  requireRole("admin"),
  async (c) => {
    const db = c.get("db");
    const auth = c.get("auth")!;
    const id = c.req.param("id");
    const { decision, note } = c.req.valid("json");

    const session = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).get();

    if (!session) return c.json({ error: "Session not found" }, 404);

    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      escalate: "escalated",
    };

    const newStatus = statusMap[decision] as "approved" | "rejected" | "escalated";

    await db
      .update(sessionsTable)
      .set({
        status: newStatus,
        notes: note || session.notes,
        reviewer: auth.name,
      })
      .where(eq(sessionsTable.id, id));

    await db.insert(auditLog).values({
      id: generateId("aud"),
      userId: auth.userId,
      actor: auth.name,
      action: `session.${decision === "escalate" ? "escalated" : decision}d`,
      resource: id,
      hash: await hashSha256(`${id}:${decision}:${Date.now()}`),
      ip: c.req.header("CF-Connecting-IP") || "unknown",
    });

    return c.json({
      id: session.id,
      applicantName: session.applicantName,
      applicantPhone: session.applicantPhone,
      applicantEmail: session.applicantEmail,
      documentType: session.documentType,
      documentNumber: session.documentNumber,
      riskScore: session.riskScore,
      status: newStatus,
      submittedAt: session.submittedAt,
      livenessScore: session.livenessScore,
      faceMatchScore: session.faceMatchScore,
      flags: JSON.parse(session.flagsJson),
      channel: session.channel,
      reviewer: auth.name,
      notes: note || session.notes,
    });
  },
);

// ── Create session (user) ────────────────────────────────
const createSessionSchema = z.object({
  applicantName: z.string().min(2),
  applicantPhone: z.string().min(10),
  applicantEmail: z.string().email().optional(),
  documentType: z.enum(["aadhaar", "pan", "passport", "voter-id"]),
  documentNumber: z.string().min(4),
  livenessScore: z.number().min(0).max(100).default(95),
  faceMatchScore: z.number().min(0).max(100).default(90),
  channel: z.enum(["wallet", "partner-app", "branch"]).default("wallet"),
});

app.post(
  "/",
  zValidator("json", createSessionSchema),
  authMiddleware,
  requireRole("user"),
  async (c) => {
    const db = c.get("db");
    const auth = c.get("auth")!;
    const data = c.req.valid("json");

    const sessionId = generateId("ses");
    const riskScore = Math.floor(Math.random() * 40);

    await db.insert(sessionsTable).values({
      id: sessionId,
      userId: auth.userId,
      applicantName: data.applicantName,
      applicantPhone: data.applicantPhone,
      applicantEmail: data.applicantEmail,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      riskScore,
      livenessScore: data.livenessScore,
      faceMatchScore: data.faceMatchScore,
      channel: data.channel,
      flagsJson: "[]",
    });

    return c.json({ id: sessionId, status: "pending" }, 201);
  },
);

export default app;
