import apiApp from "./api";
import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return apiApp.fetch(request, env, ctx);
  },
};
