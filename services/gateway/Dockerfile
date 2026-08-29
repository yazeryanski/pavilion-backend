# syntax=docker/dockerfile:1
#
# API Gateway — port 8080. The only publicly published service; depends on the other four
# over HTTP but on no datastore of its own.
#
# Targets:
#   dev  — nodemon + ts-node, source bind-mounted by docker-compose.override.yml (hot reload)
#   prod — compiled dist/, production dependencies only
#
# There is no docker-entrypoint.sh here: the gateway owns no database, so there are no
# migrations to apply before the process starts.

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
EXPOSE 8080
CMD ["pnpm", "dev"]

# ---- build ------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN pnpm build

# ---- prod -------------------------------------------------------------------
FROM base AS prod
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main.js"]
