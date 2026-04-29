import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "./lib/db";
import authRoutes from "./routes/auth";
import credentialsRoutes from "./routes/credentials";
import consentsRoutes from "./routes/consents";
import sessionsRoutes from "./routes/sessions";
import dashboardRoutes from "./routes/dashboard";
import auditRoutes from "./routes/audit";
import activityRoutes from "./routes/activity";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export type AppVariables = {
  db: ReturnType<typeof getDb>;
  auth?: import("./middleware/auth").AuthContext;
};

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// CORS for local dev
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Inject DB into context
app.use(
  "*",
  createMiddleware<{ Bindings: Env; Variables: AppVariables }>(async (c, next) => {
    const db = getDb({ DB: c.env.DB });
    c.set("db", db);
    await next();
  }),
);

// Centralized error handler
app.onError((err: Error & { status?: number }, c) => {
  console.error("API Error:", err);
  const status = (err.status ?? 500) as 200 | 400 | 401 | 403 | 404 | 500;
  return c.json(
    {
      error: {
        message: err.message ?? "Internal Server Error",
        ...(c.env.JWT_SECRET === "dev-secret-do-not-use-in-production-32chars!"
          ? { stack: err.stack }
          : {}),
      },
    },
    status,
  );
});

// Mount routes
app.route("/api/auth", authRoutes);
app.route("/api/credentials", credentialsRoutes);
app.route("/api/consents", consentsRoutes);
app.route("/api/sessions", sessionsRoutes);
app.route("/api/activity", activityRoutes);
app.route("/api/admin/dashboard", dashboardRoutes);
app.route("/api/admin/audit", auditRoutes);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

export default app;
