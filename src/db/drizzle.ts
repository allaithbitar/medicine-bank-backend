import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { config } from "../config";

console.log(
  `postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`,
);

const DbInstance = drizzle(
  `postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`,
  {
    schema,
    casing: "snake_case",
  },
);

export type TDbContext = typeof DbInstance;

export default DbInstance;
