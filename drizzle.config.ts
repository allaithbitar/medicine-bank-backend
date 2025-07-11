import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@localhost:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`,
  },
});
