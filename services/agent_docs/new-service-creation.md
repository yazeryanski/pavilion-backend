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
rm -rf .git            # detach from the boilerplate's history — this lives in the monorepo
npm install
```

The boilerplate already ships the house stack: Express, TypeScript (strict), Prisma, Winston,
Biome, envalid, nodemon, plus the `responseHandler` and `requestHeaderHandler` middlewares and the
`res.success()` / `res.error()` envelope. Do not re-add these.

## 3. Wire it up

- **package.json** — set `name` to `pavilion-be-<service>` and update `description`.
- **.env / .env.example** — copy `.env.example` to `.env`, set a unique `NODE_PORT` (each service
  gets its own), a service-specific `DATABASE_URL`, and any secrets the service needs. Never commit `.env`.
- **Install only what this service needs** on top of the boilerplate (e.g. `npm i ioredis`,
  `npm i zod`). Don't pull in deps the service won't use.
- **prisma/schema.prisma** — define this service's own models, then `npx prisma migrate dev`.
  This service owns this database; never point it at another service's DB.

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
npm run dev      # boots on NODE_PORT via nodemon
npx biome check  # lint + format must pass
```

Hit a route and confirm responses use the `{ success, data }` envelope.

## 7. Commit

Use the service tag in the commit subject, per the root CLAUDE.md convention:

```
[NOTIFICATION] feat: scaffold service from boilerplate
```
