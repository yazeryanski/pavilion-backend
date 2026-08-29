# New Service Creation

Instructions for AI agents adding a new service to Pavilion.

## 1. Decide the stack

Almost every service is Node.js / Express / TypeScript. For those, **do not scaffold by hand** —
clone the boilerplate. Only hand-roll if the service is intentionally a different stack (rare —
confirm with the user first).

## 2. Clone the boilerplate (JS/TS services)

From `services/`, clone into a folder named after the service (lowercase, e.g. `notification`):

```bash
git clone https://github.com/yazeryanski/express-ts-boilerplate.git <service>
cd <service>
rm -rf .git                 # detach from the boilerplate's history — this lives in the monorepo
rm -f package-lock.json     # Pavilion uses pnpm everywhere
pnpm install
```

The boilerplate already ships the house stack: Express, TypeScript (strict), Prisma, Winston,
Biome, envalid, nodemon, plus the `responseHandler` and `requestHeaderHandler` middlewares and the
`res.success()` / `res.error()` envelope. Do not re-add these.

## 3. Wire it up

- **package.json** — set `name` to `pavilion-be-<service>` and update `description`. Add
  `"packageManager": "pnpm@10.13.1"` and the `pnpm.onlyBuiltDependencies` block listing the Prisma
  packages (copy from any existing service — without it pnpm silently skips Prisma's postinstall).
  Ensure `"build": "tsc && tsc-alias"`; `tsc` alone leaves unresolved path aliases in `dist/`.
- **tsconfig.json** — needs `"include": ["src/**/*"]` and `"skipLibCheck": true` (the latter is
  required if the service uses `requestHeaderHandler`, which augments Express's `Request.headers`).
- **.env / .env.example** — copy `.env.example` to `.env`, set a unique `NODE_PORT` (each service
  gets its own), a service-specific `DATABASE_URL`, and any secrets the service needs. Never commit `.env`.
- **Install only what this service needs** on top of the boilerplate (e.g. `pnpm add ioredis`,
  `pnpm add zod`). Don't pull in deps the service won't use.
- **prisma/schema.prisma** — define this service's own models, then `pnpm prisma migrate dev`.
  This service owns this database; never point it at another service's DB. Commit the generated
  `prisma/migrations/` — the container entrypoint applies them with `migrate deploy`.

## 3b. Wire it into Docker

The stack runs via the root `docker-compose.yml` (see root CLAUDE.md). A new service needs:

- **`Dockerfile`, `.dockerignore`, `docker-entrypoint.sh`** — copy verbatim from an existing
  service and change only the `EXPOSE` port and the header comment.
- **`docker/postgres/init-databases.sh`** — add the service to the `for service in ...` loop so its
  role and database are created.
- **`docker-compose.yml`** — add the service with its env, `depends_on` health conditions, port
  mapping, and a healthcheck against `/api/v1/health`. Set every env var the service needs
  explicitly rather than relying on envalid devDefaults, so the `prod` target resolves too.
- **`docker-compose.override.yml`** — add the `dev` target and the `src`/`prisma` bind mounts.

## 4. Respect the boundaries

Re-read the root [CLAUDE.md](../../CLAUDE.md) "Boundaries" section. In short:

- Own database only — no cross-service DB queries, no importing another service's code.
- `post`/`profile`-style downstream services read identity from `req.userId` (set by
  `requestHeaderHandler`), never from raw `x-user-id`. Do not add JWT validation — that lives in `auth`.
- Each service is self-contained — there is no shared code module. If two services need the same type or util, duplicate it in each.

## 5. Document the service

Add a `services/<service>/CLAUDE.md` covering: what the service does, its port, its Prisma models,
run commands, and any service-specific rules. Follow the pattern of the existing services' CLAUDE.md files.

## 6. Verify

```bash
pnpm dev          # boots on NODE_PORT via nodemon
pnpm build        # must succeed — verifies tsc + tsc-alias are wired correctly
pnpm biome check  # lint + format must pass

docker compose up <service>   # must come up healthy in the stack too
```

Hit a route and confirm responses use the `{ success, data }` envelope.

## 7. Commit

Use the service tag in the commit subject, per the root CLAUDE.md convention:

```
[NOTIFICATION] feat: scaffold service from boilerplate
```
