# Newsletter Service

Per-user feed of posts authored by a user's friends. A downstream consumer — identity arrives
via headers, never JWTs.

See root `../../CLAUDE.md` for stack, conventions, response envelope, request flow, and
boundaries. Newsletter-specific notes below.

Requires PostgreSQL **and RabbitMQ** — the service refuses to start unless both connect
(`src/main.ts`). Build uses `tsc && tsc-alias`, emitting to `dist/main.js`.

## How it works

1. When a post is published, the `post` service will publish a `post.published` message to the
   `post.events` topic exchange. **This publishing is not implemented yet** — it's a later task
   in `post`. Newsletter is the ready-and-waiting consumer.
2. `src/rabbit/consumer.ts` consumes `{ postId, authorId }`, resolves the author's friends by
   calling the profile service over HTTP (`src/services/profileClient.ts` →
   `GET /api/v1/profile/:authorId`, reads `friendIds`), then **prepends** `{ postId, authorId }`
   to each friend's newsletter list (fan-out on write, de-duped by postId).
3. Each user reads their own newsletter via the GET endpoint below.

## Endpoints (`/api/v1`)

- `GET /newsletter` — the requesting user's newsletter (`req.userId`), cursor-paginated
  (`?limit` default 10, max 100; `?cursor` = a postId from the previous page).
  Returns `{ posts: [{ postId, authorId }], cursor: string | null }`.

## Data model (`prisma/schema.prisma`)

- `Newsletter { userId @id, posts Json @default("[]"), createdAt, updatedAt }`.
- `posts` is an ordered JSON array of `{ postId, authorId }`, newest first. A JSON column is
  used because a Postgres `String[]` can't hold two fields per entry. Cursor pagination is done
  in-memory over this array in `get.controller.ts`.

## RabbitMQ contract (`src/types/events.ts`)

- Exchange `post.events` (topic, durable), routing key `post.published`.
- Queue `newsletter.post.published` (durable), bound to that routing key.
- Payload: `PostPublishedEvent { postId: string; authorId: string }`.
- Bad/undeliverable messages are `nack`ed without requeue to avoid poison-message loops.
- This contract is service-local. If/when the publisher is built in `post`, duplicate the
  contract there rather than sharing a module across services.

## Config (`.env`)

- `NODE_PORT` (default 3004), `DATABASE_URL`, `RABBITMQ_URL`, `PROFILE_SERVICE_URL`.
- `docker-compose.yml` provides a local RabbitMQ (management UI at `http://localhost:15672`).
