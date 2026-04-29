// Cloudflare Worker entry — combines TanStack Start + Hono API
import apiApp from "./api";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const tanstackHandler = createStartHandler({
  handler: defaultStreamHandler,
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Route API requests to Hono
    if (url.pathname.startsWith("/api/")) {
      return apiApp.fetch(request, env, ctx);
    }

    // Delegate to TanStack Start for everything else
    return tanstackHandler(request);
  },
};
