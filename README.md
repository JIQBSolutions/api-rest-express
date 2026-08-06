# API REST de tareas

API desarrollada con Express y PostgreSQL para la evidencia **U4 > E1 - Implementación y despliegue de API**. Conserva el endpoint `Hola World` de la Evidencia 1 de la unidad 3 y agrega un CRUD completo de tareas, validaciones, manejo de errores y configuración de despliegue en Render.

## URL pública

> Pendiente: reemplazar este texto con la URL `https://...onrender.com` que Render entrega al crear el Blueprint.

Una vez desplegada, la comprobación principal se realiza en:

```text
GET https://TU-SERVICIO.onrender.com/api/health
```

La respuesta esperada es:

```json
{
  "estado": "ok",
  "baseDeDatos": "conectada"
}
```

## Tecnologías y dependencias

- Node.js 20 o superior.
- Express 5 para el servidor HTTP.
- PostgreSQL y `pg` para la persistencia.
- `dotenv` para cargar variables locales.
- `helmet` para cabeceras de seguridad.
- `cors` para permitir el consumo externo de la API.

Las versiones exactas y sus integridades se encuentran bloqueadas en `package-lock.json`.

## Variables de entorno

Copia `.env.example` como `.env` y sustituye únicamente los valores locales. El archivo `.env` está ignorado por Git para evitar exponer credenciales.

| Variable | Obligatoria | Ejemplo seguro | Descripción |
|---|---:|---|---|
| `PORT` | No | `3000` | Puerto local. Render lo asigna automáticamente. |
| `NODE_ENV` | Sí en producción | `production` | Activa el comportamiento de producción. |
| `DATABASE_URL` | Sí | `postgresql://usuario:***@host:5432/tareas` | Cadena privada de PostgreSQL. No debe publicarse. |
| `DB_SSL` | No | `false` | Usar `true` si el proveedor exige TLS. La conexión interna de Render usa `false`. |
| `USE_IN_MEMORY_DB` | Solo desarrollo | `true` | Permite una demostración local sin PostgreSQL. Nunca usar en producción. |

## Ejecución local

### Opción rápida para revisar la API

En PowerShell:

```powershell
$env:USE_IN_MEMORY_DB='true'
npm start
```

La API queda disponible en `http://localhost:3000`. Los datos de este modo se borran al reiniciar y no reemplazan la base de datos de producción.

### Opción local con PostgreSQL

1. Crea una base llamada `tareas`.
2. Copia `.env.example` como `.env`.
3. Coloca la cadena real en `DATABASE_URL` y deja `USE_IN_MEMORY_DB=false`.
4. Ejecuta:

```bash
npm install
npm start
```

La tabla `tareas` se crea automáticamente al arrancar el servicio.

## Endpoints

| Método | Endpoint | Descripción | Éxito |
|---|---|---|---:|
| `GET` | `/` | Conserva el Hola mundo original. | 200 |
| `GET` | `/api/health` | Comprueba servidor y base de datos. | 200 |
| `GET` | `/api/tareas` | Lista todas las tareas. | 200 |
| `GET` | `/api/tareas/:id` | Consulta una tarea. | 200 |
| `POST` | `/api/tareas` | Crea una tarea. | 201 |
| `PUT` | `/api/tareas/:id` | Sustituye los datos de una tarea. | 200 |
| `PATCH` | `/api/tareas/:id` | Actualiza uno o más campos. | 200 |
| `DELETE` | `/api/tareas/:id` | Elimina una tarea. | 204 |

Los recursos o rutas inexistentes devuelven `404` y los datos inválidos devuelven `400`, siempre en JSON.

### Crear una tarea

```http
POST /api/tareas
Content-Type: application/json
```

```json
{
  "titulo": "Probar API en Postman",
  "descripcion": "Solicitud creada para la evidencia",
  "completada": false
}
```

### Actualizar una tarea

`PUT` requiere los tres campos:

```json
{
  "titulo": "Probar API en Postman",
  "descripcion": "Solicitud actualizada correctamente",
  "completada": true
}
```

Para modificar solamente un campo se puede usar `PATCH`:

```json
{
  "completada": true
}
```

## Pruebas automáticas

Ejecuta:

```bash
npm test
```

La suite comprueba el Hola mundo, listado, creación, actualización, eliminación, recurso inexistente y conexión de datos. Último resultado local: **8 pruebas aprobadas y 0 fallidas**.

## Pruebas con Postman

1. Importa `postman/API-Tareas.postman_collection.json`.
2. Cambia la variable de colección `baseUrl` por la URL pública, sin diagonal final.
3. Ejecuta toda la colección con **Run collection**.

La colección realiza en orden las seis solicitudes exigidas:

| Método | Endpoint | Resultado esperado |
|---|---|---|
| GET | `/` | 200 y mensaje de bienvenida |
| GET | `/api/tareas` | 200 y arreglo de tareas |
| POST | `/api/tareas` | 201 y tarea creada |
| PUT | `/api/tareas/{{tareaId}}` | 200 y `completada: true` |
| DELETE | `/api/tareas/{{tareaId}}` | 204 sin contenido |
| GET | `/api/tareas/{{tareaId}}` | 404, prueba de error correcta |

El identificador generado por POST se guarda automáticamente en `tareaId`, por lo que no es necesario copiarlo manualmente.

Última ejecución local de la colección con el runner de Postman: **6 solicitudes ejecutadas, 0 fallidas; 9 validaciones ejecutadas, 0 fallidas**. Después del despliegue debe repetirse cambiando `baseUrl` por la URL pública para demostrar el consumo desde Internet.

## Despliegue en Render

El archivo `render.yaml` define un servicio web gratuito y una base PostgreSQL gratuita, conectados mediante una variable privada generada por Render.

1. Publica esta carpeta en un repositorio Git remoto.
2. En Render selecciona **New > Blueprint** y conecta el repositorio.
3. Confirma la creación de `api-tareas-express` y `api-tareas-db`.
4. Espera a que el evento muestre **Live**.
5. Abre `/api/health`; debe responder `200` y `baseDeDatos: conectada`.
6. Copia la URL pública y colócala en este README y en la variable `baseUrl` de Postman.

Render inyecta `DATABASE_URL` desde PostgreSQL; la contraseña nunca aparece en el código ni en `render.yaml`. El plan gratuito de PostgreSQL es suficiente para la evidencia, aunque Render indica que expira 30 días después de su creación.

## Problemas encontrados y solución

### 1. Puerto fijo incompatible con la nube

La versión inicial escuchaba únicamente en el puerto `3000`. Las plataformas cloud asignan el puerto en tiempo de ejecución, por lo que el servicio podía fallar al publicar. Se cambió a `process.env.PORT` con `3000` como valor local y se configuró la escucha en `0.0.0.0`.

### 2. La API original no tenía persistencia

El Hola mundo no utilizaba una base de datos y no podía demostrar operaciones CRUD ni persistencia en producción. Se agregó PostgreSQL, creación automática de la tabla y la variable privada `DATABASE_URL`. Render conecta ambos recursos sin publicar usuario ni contraseña.

## Seguridad aplicada

- `.env` y sus variantes están excluidos del repositorio.
- No hay contraseñas, tokens ni URL reales en el código o la documentación.
- Las consultas utilizan parámetros (`$1`, `$2`, etc.) para evitar inyección SQL.
- El cuerpo JSON tiene un límite de 20 KB y valida tipos, campos y longitudes.
- En producción, los errores internos no exponen detalles del servidor.
- `helmet` agrega cabeceras HTTP de seguridad y se oculta `X-Powered-By`.
