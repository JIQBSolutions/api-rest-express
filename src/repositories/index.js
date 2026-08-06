const { MemoryTaskRepository } = require("./memoryTaskRepository");
const { PostgresTaskRepository } = require("./postgresTaskRepository");

// Crea el repositorio de tareas adecuado según la configuración.
function createTaskRepository(config) {
  if (config.useMemoryDb) {
    return new MemoryTaskRepository();
  }

  return new PostgresTaskRepository({
    connectionString: config.databaseUrl,
    ssl: config.databaseSsl,
  });
}

module.exports = {
  createTaskRepository,
  MemoryTaskRepository,
  PostgresTaskRepository,
};
