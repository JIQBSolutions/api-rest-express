const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createApp } = require("../src/app");
const { MemoryTaskRepository } = require("../src/repositories");

test("flujo CRUD requerido por la evidencia", async (t) => {
  const repository = new MemoryTaskRepository();
  await repository.initialize();
  const app = createApp({ repository, nodeEnv: "test" });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  let taskId;

  try {
    await t.test("GET / conserva el Hola mundo", async () => {
      const response = await fetch(`${baseUrl}/`);
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.match(body.mensaje, /Hola World/);
    });

    await t.test("GET /api/tareas devuelve la colección", async () => {
      const response = await fetch(`${baseUrl}/api/tareas`);
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.deepEqual(body, { datos: [], total: 0 });
    });

    await t.test("POST /api/tareas crea un recurso", async () => {
      const response = await fetch(`${baseUrl}/api/tareas`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          titulo: "Preparar evidencia",
          descripcion: "Documentar el despliegue",
          completada: false,
        }),
      });
      const body = await response.json();
      assert.equal(response.status, 201);
      assert.equal(body.datos.titulo, "Preparar evidencia");
      taskId = body.datos.id;
    });

    await t.test("PUT /api/tareas/:id actualiza el recurso", async () => {
      const response = await fetch(`${baseUrl}/api/tareas/${taskId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          titulo: "Preparar evidencia",
          descripcion: "Despliegue documentado",
          completada: true,
        }),
      });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.datos.completada, true);
    });

    await t.test("DELETE /api/tareas/:id elimina el recurso", async () => {
      const response = await fetch(`${baseUrl}/api/tareas/${taskId}`, {
        method: "DELETE",
      });
      assert.equal(response.status, 204);
    });

    await t.test("GET inexistente comprueba el manejo de errores", async () => {
      const response = await fetch(`${baseUrl}/api/tareas/${taskId}`);
      const body = await response.json();
      assert.equal(response.status, 404);
      assert.equal(body.error, "Tarea no encontrada.");
    });

    await t.test("GET /api/health verifica la base de datos", async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.baseDeDatos, "conectada");
    });
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await repository.close();
  }
});
