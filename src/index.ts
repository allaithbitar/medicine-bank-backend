import app from "./server";

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

app.listen(Bun.env.PORT, () =>
  console.log(`🦊 Server started at ${app.server?.url.origin}`),
);
