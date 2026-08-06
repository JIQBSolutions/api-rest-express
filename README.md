# API REST de tareas

API desarrollada con Express y PostgreSQL de Supabase para la evidencia **U4 > E1 - Implementación y despliegue de API**. Conserva el endpoint `Hola World` de la Evidencia 1 de la unidad 3 y agrega un CRUD completo de tareas, validaciones, manejo de errores y configuración de despliegue en Render.

## URL pública

**Producción:** https://api-tareas-express.onrender.com

Comprobación de servidor y conexión con Supabase:

```text
GET https://api-tareas-express.onrender.com/api/health
```

Respuesta comprobada el 6 de agosto de 2026:

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
- `dotenv` como compatibilidad opcional para pruebas locales; Render no depende de archivos `.env`.
- `helmet` para cabeceras de seguridad.
- `cors` para permitir el consumo externo de la API.

Las versiones exactas y sus integridades se encuentran bloqueadas en `package-lock.json`.

## Variables de entorno

La API no requiere un archivo `.env` ni un archivo de ejemplo para funcionar. En producción, Render proporciona las variables directamente al proceso de Node.js. `PORT` es asignada por la plataforma; `NODE_ENV` y `DB_SSL` están declaradas en `render.yaml`; y `DATABASE_URL` se captura en Render como secreto durante la creación del Blueprint.

| Variable | Configuración en producción | Descripción |
|---|---|---|
| `PORT` | Automática | Puerto HTTP asignado por Render. |
| `NODE_ENV` | `production` en `render.yaml` | Activa el comportamiento de producción. |
| `DATABASE_URL` | Secreto de Render | URI Session pooler privada de PostgreSQL en Supabase. |
| `DB_SSL` | `true` en `render.yaml` | Activa TLS para la conexión con Supabase. |
| `USE_IN_MEMORY_DB` | No se configura | Se utiliza únicamente para pruebas o demostraciones locales. |

Las contraseñas y cadenas privadas de conexión no se almacenan en GitHub.

## Ejecución local

### Opción rápida para revisar la API

En PowerShell:

```powershell
$env:USE_IN_MEMORY_DB='true'
npm start
```

La API queda disponible en `http://localhost:3000`. Los datos de este modo se borran al reiniciar y no reemplazan la base de datos de producción.

### Opción local con PostgreSQL o Supabase

1. En Supabase abre **Connect > Session pooler** y copia la URI del puerto `5432`.
2. Define las variables directamente en la terminal de PowerShell de esa sesión:

```powershell
$env:DATABASE_URL='PEGA_AQUI_LA_URI_PRIVADA_DE_SUPABASE'
$env:DB_SSL='true'
$env:USE_IN_MEMORY_DB='false'
```

3. Ejecuta:

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
2. Confirma que la variable de colección `baseUrl` tenga `https://api-tareas-express.onrender.com`, sin diagonal final.
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

Última ejecución contra la API pública en Render, el 6 de agosto de 2026: **6 solicitudes ejecutadas, 0 fallidas; 9 validaciones ejecutadas, 0 fallidas**. Se comprobaron los estados `200`, `201`, `204` y el error controlado `404` usando PostgreSQL de Supabase.

## Despliegue en Render

El archivo `render.yaml` define un servicio web gratuito y solicita la conexión de Supabase como una variable privada durante la creación del Blueprint.

1. Publica esta carpeta en un repositorio Git remoto.
2. En Render selecciona **New > Blueprint** y conecta el repositorio.
3. Cuando Render solicite `DATABASE_URL`, pega la URI **Session pooler** de Supabase con tu contraseña; no la guardes en Git.
4. Confirma la creación de `api-tareas-express`.
5. Espera a que el evento muestre **Live**.
6. Abre `/api/health`; debe responder `200` y `baseDeDatos: conectada`.
7. Copia la URL pública y colócala en este README y en la variable `baseUrl` de Postman. En este proyecto ya quedó configurada como `https://api-tareas-express.onrender.com`.

Render guarda `DATABASE_URL` como secreto porque el Blueprint la declara con `sync: false`; la contraseña nunca aparece en el código ni en `render.yaml`. La tabla `tareas` se crea automáticamente en Supabase durante el primer arranque.

## Problemas encontrados y solución

### 1. Puerto fijo incompatible con la nube

La versión inicial escuchaba únicamente en el puerto `3000`. Las plataformas cloud asignan el puerto en tiempo de ejecución, por lo que el servicio podía fallar al publicar. Se cambió a `process.env.PORT` con `3000` como valor local y se configuró la escucha en `0.0.0.0`.

### 2. La API original no tenía persistencia

El Hola mundo no utilizaba una base de datos y no podía demostrar operaciones CRUD ni persistencia en producción. Se agregó PostgreSQL en Supabase, creación automática de la tabla y la variable privada `DATABASE_URL`. Render recibe la conexión como secreto sin publicar usuario ni contraseña.

## Seguridad aplicada

- El despliegue no utiliza archivos `.env`; Render administra las variables y secretos directamente.
- No hay contraseñas, tokens ni cadenas privadas de conexión en el código o la documentación; únicamente se publica la URL HTTP de la API.
- Las consultas utilizan parámetros (`$1`, `$2`, etc.) para evitar inyección SQL.
- El cuerpo JSON tiene un límite de 20 KB y valida tipos, campos y longitudes.
- En producción, los errores internos no exponen detalles del servidor.
- `helmet` agrega cabeceras HTTP de seguridad y se oculta `X-Powered-By`.
