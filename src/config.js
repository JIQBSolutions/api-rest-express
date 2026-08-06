const path = require("node:path");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

// Carga la configuración de ambiente y valida los valores necesarios.
function loadConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const port = Number.parseInt(process.env.PORT || "3000", 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un número entre 1 y 65535.");
  }

  const useMemoryDb =
    process.env.USE_IN_MEMORY_DB === "true" || nodeEnv === "test";
  const databaseUrl = process.env.DATABASE_URL;

  if (!useMemoryDb && !databaseUrl) {
    throw new Error(
      "Falta DATABASE_URL. Configúrala o usa USE_IN_MEMORY_DB=true solo para desarrollo.",
    );
  }

  return {
    nodeEnv,
    port,
    databaseUrl,
    useMemoryDb,
    databaseSsl: process.env.DB_SSL === "true",
  };
}

module.exports = { loadConfig };
