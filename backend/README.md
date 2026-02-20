# Backend Task API Instructions

This document explains how to set up, run, and interact with the Redis-backed Task Management API.

## 1. Prerequisites
- Node.js v18+ installed
- npm (comes with Node.js)
- Docker & Docker Compose installed (for Redis)

## 2. Install dependencies
From the `backend/` folder:

```bash
npm install
```

## 3. Environment configuration
Create a `.env` file (already present in this repo) with:

## 4. Start Redis

Start the Docker-based Redis container:

```bash
docker compose up -d
```

This launches a `redis:7-alpine` container on port `6379`.

To stop Redis later:

```bash
docker compose down
```

## 5. Run the project

### Development mode (auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000` after connecting to Redis.

### Production build

```bash
npm run build
npm start
```

## 6. Project structure (relevant files)

- `docker-compose.yml` – Redis container definition
- `src/config/redis.ts` – Redis client (ioredis) singleton
- `src/app.ts` – Express app configuration
- `src/server.ts` – Server entry point (connects to Redis first)
- `src/routes/tasks.routes.ts` – Task API routes
- `src/controllers/tasks.controller.ts` – Task controllers (validation + async Redis calls)
- `src/models/task.ts` – Task interfaces and Redis-backed repository
- `src/middleware/errorHandler.ts` – Centralized error handler

## 7. API Overview

All task endpoints are mounted under the `/api` prefix.

### Health
- `GET /health` – Simple health check

### Tasks

1. **List tasks**
   - `GET /api/v1/tasks`
   - Response: `200 OK`
   - Example:
     ```json
     {
       "data": [
         {
           "id": "1739968540000-abc123xy",
           "title": "My first task",
           "description": "Optional description",
           "status": "pending",
           "createdAt": "2026-02-20T10:00:00.000Z",
           "updatedAt": "2026-02-20T10:00:00.000Z"
         }
       ]
     }
     ```

2. **Get a single task**
   - `GET /api/v1/tasks/:id`
   - Response:
     - `200 OK` with task data
     - `404 Not Found` if task does not exist

3. **Create a task**
   - `POST /api/v1/tasks`
   - Request body:
     ```json
     {
       "title": "My first task",
       "description": "Optional description"
     }
     ```
   - Validation:
     - `title` is required, non-empty string
     - `description` optional string
   - Response:
     - `201 Created` with created task
     - `400 Bad Request` if validation fails

4. **Update a task**
   - `PUT /api/v1/tasks/:id`
   - Request body (all fields optional, partial update allowed):
     ```json
     {
       "title": "Updated title",
       "description": "Updated description",
       "status": "in-progress"
     }
     ```
   - Validation:
     - `title` (if provided) must be non-empty string
     - `description` (if provided) must be string
     - `status` (if provided) must be one of: `"pending" | "in-progress" | "completed"`
   - Response:
     - `200 OK` with updated task
     - `400 Bad Request` if validation fails
     - `404 Not Found` if task does not exist

5. **Delete a task**
   - `DELETE /api/v1/tasks/:id`
   - Response:
     - `204 No Content` on success
     - `404 Not Found` if task does not exist

## 8. Error response format

```json
{
  "error": {
    "message": "Error message here",
    "statusCode": 400
  }
}
```

## 9. Notes about storage

- Tasks are stored in **Redis** using `ioredis`.
- Each task is stored as a JSON string under key `task:<id>`.
- A Redis Set `tasks:index` tracks all task IDs for listing.
- Data persists across server restarts (as long as the Redis container is running).
- Run `docker compose down -v` to wipe all data (removes the Redis volume).

## 10. Quick start summary

```bash
# 1. Start Redis
docker compose up -d

# 2. Install deps
npm install

# 3. Start the server
npm run dev

# 4. Test it
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task"}'
curl http://localhost:3000/api/tasks
```
