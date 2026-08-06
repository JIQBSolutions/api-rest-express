const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const { HttpError, validateId, validateTaskInput } = require("./validation");

function createApp({ repository, nodeEnv = "development" }) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "20kb" }));

  // Se conserva el endpoint original de la Evidencia 1.
  app.get("/", (request, response) => {
    response.json({
      mensaje: "Hola World desde la UTCH BIS!",
      api: "API REST de tareas",
      endpoints: "/api/tareas",
    });
  });

  app.get("/api/health", async (request, response) => {
    await repository.ping();
    response.json({ estado: "ok", baseDeDatos: "conectada" });
  });

  app.get("/api/tareas", async (request, response) => {
    const tareas = await repository.findAll();
    response.json({ datos: tareas, total: tareas.length });
  });

  app.get("/api/tareas/:id", async (request, response) => {
    const id = validateId(request.params.id);
    const tarea = await repository.findById(id);

    if (!tarea) {
      throw new HttpError(404, "Tarea no encontrada.");
    }

    response.json({ datos: tarea });
  });

  app.post("/api/tareas", async (request, response) => {
    const input = validateTaskInput(request.body, { partial: false });
    const tarea = await repository.create(input);
    response.status(201).location(`/api/tareas/${tarea.id}`).json({ datos: tarea });
  });

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

  app.delete("/api/tareas/:id", async (request, response) => {
    const id = validateId(request.params.id);
    const deleted = await repository.remove(id);

    if (!deleted) {
      throw new HttpError(404, "Tarea no encontrada.");
    }

    response.status(204).send();
  });

  app.use((request, response, next) => {
    next(new HttpError(404, "Ruta no encontrada."));
  });

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
