import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";

const DbInstance = drizzle(
  `postgresql://${Bun.env.POSTGRES_USER}:${Bun.env.POSTGRES_PASSWORD}@${Bun.env.POSTGRES_HOST}:${Bun.env.POSTGRES_PORT}/${Bun.env.POSTGRES_DB}`,
  {
    schema,
    casing: "snake_case",
  },
);

// if (Bun.env.NODE_ENV === "production") {
(async () => {
  await migrate(DbInstance, { migrationsFolder: "src/db/migrations" });
  console.info("Finished Running Migrations");
})();
// }

export type TDbContext = typeof DbInstance;

export default DbInstance;
