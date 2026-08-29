#!/bin/sh
# Applies pending Prisma migrations, then hands off to the container command.
#
# Ordering is guaranteed by compose (`depends_on: condition: service_healthy`), so no
# wait-for-postgres loop is needed here. The prisma binary is invoked directly from
# node_modules/.bin so the runtime does not depend on corepack/pnpm being resolvable.

set -e

echo "[entrypoint] applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] starting: $*"
exec "$@"
