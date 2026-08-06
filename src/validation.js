// Validaciones compartidas para la API de tareas.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function validateId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "El id debe ser un entero positivo.");
  }

  return Number(value);
}

function validateTaskInput(body, { partial }) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "El cuerpo debe ser un objeto JSON.");
  }

  const allowed = ["titulo", "descripcion", "completada"];
  const received = Object.keys(body);
  const unknown = received.filter((field) => !allowed.includes(field));

  if (unknown.length > 0) {
    throw new HttpError(400, `Campos no permitidos: ${unknown.join(", ")}.`);
  }

  if (partial && received.length === 0) {
    throw new HttpError(400, "Envía al menos un campo para actualizar.");
  }

  if (!partial) {
    for (const field of allowed) {
      if (!Object.hasOwn(body, field)) {
        throw new HttpError(400, `El campo ${field} es obligatorio.`);
      }
    }
  }

  const result = {};

  if (Object.hasOwn(body, "titulo")) {
    if (typeof body.titulo !== "string" || body.titulo.trim().length === 0) {
      throw new HttpError(400, "El título debe ser texto y no puede estar vacío.");
    }
    if (body.titulo.trim().length > 120) {
      throw new HttpError(400, "El título no puede superar 120 caracteres.");
    }
    result.titulo = body.titulo.trim();
  }

  if (Object.hasOwn(body, "descripcion")) {
    if (typeof body.descripcion !== "string") {
      throw new HttpError(400, "La descripción debe ser texto.");
    }
    if (body.descripcion.length > 1000) {
      throw new HttpError(400, "La descripción no puede superar 1000 caracteres.");
    }
    result.descripcion = body.descripcion.trim();
  }

  if (Object.hasOwn(body, "completada")) {
    if (typeof body.completada !== "boolean") {
      throw new HttpError(400, "completada debe ser true o false.");
    }
    result.completada = body.completada;
  }

  return result;
}

module.exports = { HttpError, validateId, validateTaskInput };
