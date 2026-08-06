const { createApp } = require("./app");
const { loadConfig } = require("./config");
const { createTaskRepository } = require("./repositories");

// Punto de entrada de la aplicación. Carga la configuración, inicializa
// el repositorio de tareas y levanta el servidor HTTP.
async function startServer() {
  const config = loadConfig();
  const repository = createTaskRepository(config);

  await repository.initialize();

  const app = createApp({ repository, nodeEnv: config.nodeEnv });
  const server = app.listen(config.port, "0.0.0.0", () => {
    console.log(`API disponible en el puerto ${config.port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} recibido. Cerrando el servicio...`);
    server.close(async () => {
      await repository.close();
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  console.error("No fue posible iniciar la API:", error.message);
  process.exit(1);
});
