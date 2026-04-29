import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/api/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    databaseId: process.env.D1_DATABASE_ID || "",
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    token: process.env.CLOUDFLARE_API_TOKEN || "",
  },
});
