import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export type Role = "user" | "admin";

/* ============================================================
 * Zenetrix Database Schema — Cloudflare D1 (SQLite)
 * ============================================================ */

// ── Users ────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  phone: text("phone").unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  role: text("role", { enum: ["user", "admin"] })
    .notNull()
    .default("user"),
  avatarColor: text("avatar_color").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

// ── OTP codes (short-lived) ─────────────────────────────────
export const otpCodes = sqliteTable("otp_codes", {
  id: text("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

// ── Credentials (KYC verifiable credentials) ────────────────
export const credentials = sqliteTable("credentials", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type", {
    enum: ["kyc-basic", "kyc-full", "address-proof", "income-proof"],
  }).notNull(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  issuedAt: text("issued_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  status: text("status", { enum: ["active", "revoked", "expired"] })
    .notNull()
    .default("active"),
  serial: text("serial").notNull(),
  claimsJson: text("claims_json").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

// ── Consent requests ────────────────────────────────────────
export const consents = sqliteTable("consents", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  institution: text("institution").notNull(),
  institutionType: text("institution_type", {
    enum: ["bank", "nbfc", "broker", "insurer", "exchange"],
  }).notNull(),
  purpose: text("purpose").notNull(),
  scopeJson: text("scope_json").notNull(),
  requestedAt: text("requested_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  status: text("status", {
    enum: ["pending", "active", "revoked", "expired"],
  })
    .notNull()
    .default("pending"),
  duration: text("duration").notNull(),
  respondedAt: text("responded_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

// ── KYC Sessions ────────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  applicantName: text("applicant_name").notNull(),
  applicantPhone: text("applicant_phone").notNull(),
  applicantEmail: text("applicant_email"),
  documentType: text("document_type", {
    enum: ["aadhaar", "pan", "passport", "voter-id"],
  }).notNull(),
  documentNumber: text("document_number").notNull(),
  riskScore: integer("risk_score").notNull().default(0),
  status: text("status", {
    enum: ["pending", "in-review", "approved", "rejected", "escalated"],
  })
    .notNull()
    .default("pending"),
  submittedAt: text("submitted_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  livenessScore: integer("liveness_score").notNull().default(0),
  faceMatchScore: integer("face_match_score").notNull().default(0),
  flagsJson: text("flags_json").notNull().default("[]"),
  channel: text("channel", { enum: ["wallet", "partner-app", "branch"] })
    .notNull()
    .default("wallet"),
  reviewer: text("reviewer"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

// ── Activity feed (user-facing) ─────────────────────────────
export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  at: text("at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

// ── Audit log (admin-facing, append-only) ──────────────────
export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  hash: text("hash").notNull(),
  ip: text("ip").notNull(),
  at: text("at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
