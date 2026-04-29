import { SignJWT, jwtVerify } from "jose";
import type { Role } from "../schema";

const encoder = new TextEncoder();

function getSecret(env: { JWT_SECRET: string }) {
  return encoder.encode(env.JWT_SECRET);
}

export async function signToken(
  payload: { sub: string; role: Role; name: string },
  env: { JWT_SECRET: string },
  expiresIn = "7d",
): Promise<string> {
  const secret = getSecret(env);
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(
  token: string,
  env: { JWT_SECRET: string },
): Promise<{ sub: string; role: Role; name: string } | null> {
  try {
    const secret = getSecret(env);
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      role: (payload.role as Role) || "user",
      name: (payload.name as string) || "",
    };
  } catch {
    return null;
  }
}
