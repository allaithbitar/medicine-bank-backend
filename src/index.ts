import app from "./server";
import { readFileSync } from "fs";

const signals = ["SIGINT", "SIGTERM", "SIGKILL"];

for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`Received ${signal}. Initiating graceful shutdown...`);
    await app.stop();
    process.exit(0);
  });
}

process.on("uncaughtException", (error) => {
  console.error(error);
});

process.on("unhandledRejection", (error) => {
  console.error(error);
});

// HTTPS configuration
const useHttps = Bun.env.USE_HTTPS === "true";
const serverOptions: any = {
  port: Bun.env.PORT,
};

if (useHttps) {
  try {
    serverOptions.tls = {
      key: readFileSync(Bun.env.SSL_KEY_PATH || "/app/certs/localhost-key.pem"),
      cert: readFileSync(Bun.env.SSL_CERT_PATH || "/app/certs/localhost-cert.pem"),
    };
    console.log("🔒 HTTPS enabled");
  } catch (error) {
    console.warn("⚠️  SSL certificates not found, falling back to HTTP");
    console.error(error);
  }
}

app.listen(serverOptions, () => {
  const protocol = useHttps && serverOptions.tls ? "https" : "http";
  console.log(`🦊 Server started at ${protocol}://localhost:${Bun.env.PORT}`);
});
