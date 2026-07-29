# Pavilion Backend

Pavilion — A social network application built on a microservice architecture.

## Architecture

```
services/
  auth/     - Authentication & token issuance
  post/     - Post CRUD and image uploads
  profile/  - User profile management
shared/
  types/    - (planned) shared TypeScript types
  utils/    - (planned) shared utility code
```

## Stack (all services)

- Node.js / Express / TypeScript (strict mode)
- Prisma + PostgreSQL (each service has its own database)
- Winston (logging: console + `logs/error.log` + `logs/combined.log`)
- Biome (linter + formatter) — required for all services
- envalid (environment variable validation)
- Zod (input validation — use when validation is needed; not mandatory in every service)
- nodemon (dev server)

Each service has its own CLAUDE.md with service-specific details.

## Commands

Same across services (run from `services/<service>/`):

```
npm run dev     # nodemon
npm run build   # tsc (post uses tsc-alias)
npm start       # node dist/main.js
npx biome check # lint + format
```

Each service refuses to start unless its datastore connects (`src/main.ts`); some need extras (auth: Redis, post: S3-compatible store).

## Conventions (all services)

- Routes under `/api/v1`; every service exposes `GET /health`.
- Env validated via envalid in `src/config.ts` (see each `.env.example`).
- Path aliases (`@/`, `@utils/`, …) defined in `tsconfig.json`.
- One Prisma model per service in `prisma/schema.prisma`.

## API Response Shape

All responses use a single envelope, implemented by `responseHandler` middleware:

- Success: `{ success: true, data: T }`
- Error:   `{ success: false, data: string }` (error message in `data`)

Never build response objects manually. Always use `res.success(data?)` and `res.error(message, statusCode?)`.

## Request Flow

```
Client → API Gateway / upstream → injects x-user-id, x-service-name, x-request-id headers → service
```

`post` and `profile` use `requestHeaderHandler` middleware to map these headers onto `req.userId`,
`req.serviceName`, and `req.requestId`. The `auth` service does **not** use `requestHeaderHandler` —
it is the upstream issuer, not a downstream consumer.

## Boundaries (Do NOT)

- Each service owns its own database — never query another service's DB directly.
- Never import code from another service's directory.
- Inter-service synchronous calls use direct HTTP. Async/fan-out messaging is planned via RabbitMQ (see Roadmap).
- Never add JWT validation inside `post` or `profile` — JWT verification is handled exclusively in `auth`.
- In `post` and `profile`: never read `x-user-id` from raw headers. Use `req.userId` (set by `requestHeaderHandler`).
- Shared types and utilities go in `shared/` — never duplicate across services.

## Commits

```
[SERVICE] type: description

[AUTH] feat: add token rotation on refresh
[POST] fix: ownership check on delete
[PROFILE] feat: add avatar support
```

## Roadmap

- **RabbitMQ** — async messaging for notifications and fan-out events (not yet implemented).

## READ WHEN

- Working on a specific service → `services/<service>/CLAUDE.md`
- Setting up a new service → `services/agent_docs/new-service-creation.md`
