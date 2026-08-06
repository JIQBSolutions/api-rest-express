const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const { HttpError, validateId, validateTaskInput } = require("./validation");

// Crea y configura la aplicación Express para la API de tareas.
function createApp({ repository, nodeEnv = "development" }) {
  const app = express();

  app.disable("x-powered-by"); // Oculta información innecesaria de Express.
  app.set("trust proxy", 1);
  app.use(helmet()); // Añade cabeceras de seguridad.
  app.use(cors());
  app.use(express.json({ limit: "20kb" })); // Limita el tamaño del JSON entrante.

  // Ruta principal informativa.
  app.get("/", (request, response) => {
    response.json({
      mensaje: "Hola World desde la UTCH BIS!",
      api: "API REST de tareas",
      endpoints: "/api/tareas",
    });
  });

  // Verifica que la API y la base de datos respondan.
  app.get("/api/health", async (request, response) => {
    await repository.ping();
    response.json({ estado: "ok", baseDeDatos: "conectada" });
  });

  // Lista todas las tareas.
  app.get("/api/tareas", async (request, response) => {
    const tareas = await repository.findAll();
    response.json({ datos: tareas, total: tareas.length });
  });

  // Obtiene una tarea por su id.
  app.get("/api/tareas/:id", async (request, response) => {
    const id = validateId(request.params.id);
    const tarea = await repository.findById(id);

    if (!tarea) {
      throw new HttpError(404, "Tarea no encontrada.");
    }

    response.json({ datos: tarea });
  });

  // Crea una tarea nueva.
  app.post("/api/tareas", async (request, response) => {
    const input = validateTaskInput(request.body, { partial: false });
    const tarea = await repository.create(input);
    response.status(201).location(`/api/tareas/${tarea.id}`).json({ datos: tarea });
  });

  // Actualiza una tarea completa o parcial según el método HTTP.
  async function updateTask(request, response, partial) {
    const id = validateId(request.params.id);
    const input = validateTaskInput(request.body, { partial });
    const tarea = await repository.update(id, input);

    if (!tarea) {
      throw new HttpError(404, "Tarea no encontrada.");
    }

    response.json({ datos: tarea });
  }

  app.put("/api/tareas/:id", (request, response) =>
    updateTask(request, response, false),
  );
  app.patch("/api/tareas/:id", (request, response) =>
    updateTask(request, response, true),
  );

  // Elimina una tarea por id.
  app.delete("/api/tareas/:id", async (request, response) => {
    const id = validateId(request.params.id);
    const deleted = await repository.remove(id);

    if (!deleted) {
      throw new HttpError(404, "Tarea no encontrada.");
    }

    response.status(204).send();
  });

  // Maneja rutas desconocidas con un 404.
  app.use((request, response, next) => {
    next(new HttpError(404, "Ruta no encontrada."));
  });

  // Maneja errores y formatea la respuesta según el entorno.
  app.use((error, request, response, next) => {
    const status = error.status || 500;

    if (status >= 500) {
      console.error("Error interno:", error.message);
    }

    response.status(status).json({
      error: status === 500 && nodeEnv === "production"
        ? "Error interno del servidor."
        : error.message,
    });
  });

  return app;
}

module.exports = { createApp };
