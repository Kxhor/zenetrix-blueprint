import { createMiddleware } from "hono/factory";
import { verifyToken } from "../lib/auth";
import type { Role } from "../schema";
import type { Env, AppVariables } from "..";

export interface AuthContext {
  userId: string;
  role: Role;
  name: string;
}

export const authMiddleware = createMiddleware<{
  Variables: AppVariables & { auth: AuthContext };
  Bindings: Env;
}>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = header.slice(7);
  const payload = await verifyToken(token, c.env);
  if (!payload) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("auth", {
    userId: payload.sub,
    role: payload.role,
    name: payload.name,
  });

  await next();
});

export const requireRole = (role: Role) =>
  createMiddleware<{
    Variables: AppVariables & { auth: AuthContext };
    Bindings: Env;
  }>(async (c, next) => {
    const auth = c.get("auth");
    if (auth.role !== role) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  });
