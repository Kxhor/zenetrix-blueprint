import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, desc } from "drizzle-orm";
import { signToken } from "../lib/auth";
import { generateId } from "../lib/utils";
import { users, otpCodes } from "../schema";
import type { Db } from "../lib/db";

const app = new Hono<{
  Bindings: { DB: D1Database; JWT_SECRET: string };
  Variables: { db: Db };
}>();

// ── Send OTP ──────────────────────────────────────────────
const sendOtpSchema = z.object({ phone: z.string().min(10) });

app.post("/otp/send", zValidator("json", sendOtpSchema), async (c) => {
  const { phone } = c.req.valid("json");
  const db = c.get("db");

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await db.insert(otpCodes).values({
    id: generateId("otp"),
    phone,
    code,
    expiresAt,
  });

  // In production, integrate with SMS provider (Twilio, MSG91, etc.)
  // For now, log the OTP for development
  console.log(`[OTP] Phone: ${phone}, Code: ${code}`);

  return c.json({ success: true, expiresIn: 300, _devCode: code });
});

// ── Verify OTP ────────────────────────────────────────────
const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
});

app.post("/otp/verify", zValidator("json", verifyOtpSchema), async (c) => {
  const { phone, code } = c.req.valid("json");
  const db = c.get("db");
  const env = c.env;

  const otpRows = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.phone, phone))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1)
    .all();

  if (!otpRows.length || otpRows[0].code !== code) {
    return c.json({ error: "Invalid OTP" }, 400);
  }

  const otp = otpRows[0];

  if (new Date(otp.expiresAt) < new Date()) {
    return c.json({ error: "OTP expired" }, 400);
  }

  // Clean up used OTP
  await db.delete(otpCodes).where(eq(otpCodes.id, otp.id));

  // Find or create user
  let user = await db.select().from(users).where(eq(users.phone, phone)).get();

  const colors = ["#0EA5E9", "#16A34A", "#7C3AED", "#F59E0B", "#EC4899"];
  const isNewUser = !user;

  if (!user) {
    const userId = generateId("usr");
    await db.insert(users).values({
      id: userId,
      phone,
      name: "Aarav Sharma",
      role: "user",
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    });
    user = await db.select().from(users).where(eq(users.id, userId)).get();
  }

  const token = await signToken(
    { sub: user!.id, role: user!.role as "user" | "admin", name: user!.name },
    env,
  );

  return c.json({
    token,
    user: {
      id: user!.id,
      name: user!.name,
      phone: user!.phone,
      role: user!.role,
      avatarColor: user!.avatarColor,
    },
    isNewUser,
  });
});

// ── Admin Login ───────────────────────────────────────────
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

app.post("/admin/login", zValidator("json", adminLoginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = c.get("db");
  const env = c.env;

  // For demo: accept any password, create admin if not exists
  // In production, use bcrypt to verify passwordHash
  let admin = await db.select().from(users).where(eq(users.email, email)).get();

  const colors = ["#0EA5E9", "#16A34A", "#7C3AED", "#F59E0B", "#EC4899"];

  if (!admin) {
    const adminId = generateId("adm");
    const name = email
      .split("@")[0]
      .replace(/[.]/g, " ")
      .replace(/\b\w/g, (ch: string) => ch.toUpperCase());

    await db.insert(users).values({
      id: adminId,
      email,
      passwordHash: password, // In production: hash with bcrypt
      name,
      role: "admin",
      avatarColor: colors[0],
    });
    admin = await db.select().from(users).where(eq(users.id, adminId)).get();
  }

  const token = await signToken({ sub: admin!.id, role: "admin", name: admin!.name }, env);

  return c.json({
    token,
    user: {
      id: admin!.id,
      name: admin!.name,
      email: admin!.email,
      role: admin!.role,
      avatarColor: admin!.avatarColor,
    },
  });
});

// ── Register (phone + optional details) ───────────────────
const registerSchema = z.object({
  phone: z.string().min(10),
  name: z.string().min(2).optional(),
});

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const { phone, name } = c.req.valid("json");
  const db = c.get("db");
  const env = c.env;

  const existing = await db.select().from(users).where(eq(users.phone, phone)).get();

  if (existing) {
    return c.json({ error: "Phone already registered" }, 409);
  }

  const colors = ["#0EA5E9", "#16A34A", "#7C3AED", "#F59E0B", "#EC4899"];
  const userId = generateId("usr");

  await db.insert(users).values({
    id: userId,
    phone,
    name: name || "New User",
    role: "user",
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
  });

  const user = await db.select().from(users).where(eq(users.id, userId)).get();

  const token = await signToken({ sub: user!.id, role: "user", name: user!.name }, env);

  return c.json(
    {
      token,
      user: {
        id: user!.id,
        name: user!.name,
        phone: user!.phone,
        role: user!.role,
        avatarColor: user!.avatarColor,
      },
    },
    201,
  );
});

export default app;
