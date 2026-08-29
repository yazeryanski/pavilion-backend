# syntax=docker/dockerfile:1
#
# Auth service — port 3000. Requires Postgres and Redis.
#
# Targets:
#   dev  — nodemon + ts-node, source bind-mounted by docker-compose.override.yml (hot reload)
#   prod — compiled dist/, production dependencies only
#
# Build a specific target with:  docker compose build --build-arg ... / --target prod

# ---- base -------------------------------------------------------------------
FROM node:24-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
# Pin pnpm in the image so builds do not depend on corepack resolving a version at runtime.
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# ---- deps -------------------------------------------------------------------
# Split from the source copy so dependency layers cache across code changes.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- dev --------------------------------------------------------------------
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
RUN pnpm prisma generate
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pnpm", "dev"]

# ---- build ------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN pnpm prisma generate && pnpm build

# ---- prod -------------------------------------------------------------------
FROM base AS prod
ENV NODE_ENV=production
# `prisma` is a production dependency: the entrypoint runs `migrate deploy` at startup and
# `prisma generate` is needed here to emit the client against the runtime dependency tree.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY prisma ./prisma
RUN pnpm prisma generate
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
