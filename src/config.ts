import env from "env-var";

export const config = {
  NODE_ENV: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["production", "development"]),
  // DATABASE_URL: env.get("DATABASE_URL").required().asString(),
  PORT: env.get("PORT").default(3000).asPortNumber(),
  JWT_SECRET: env.get("JWT_SECRET").required().asString(),
  JWT_TOKEN_EXPIRE: env.get("JWT_TOKEN_EXPIRE").required().asString(),
  JWT_REFRESH_TOKEN_EXPIRE: env
    .get("JWT_REFRESH_TOKEN_EXPIRE")
    .required()
    .asString(),

  POSTGRES_USER: env.get("POSTGRES_USER").required().asString(),
  POSTGRES_PASSWORD: env.get("POSTGRES_PASSWORD").required().asString(),
  POSTGRES_DB: env.get("POSTGRES_DB").required().asString(),
  POSTGRES_PORT: env.get("POSTGRES_PORT").required().asInt(),
  POSTGRES_HOST: env.get("POSTGRES_HOST").asString(),
  // API_URL: env
  //   .get("API_URL")
  //   .default(`https://${env.get("PUBLIC_DOMAIN").asString()}`)
  //   .asString(),
  // LOCK_STORE: env.get("LOCK_STORE").default("memory").asEnum(["memory"]),
};
