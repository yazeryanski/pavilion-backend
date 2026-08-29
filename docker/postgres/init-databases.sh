#!/bin/bash
# Creates one role + one database per service.
#
# Each Pavilion service owns its own database (see root CLAUDE.md "Boundaries") — a single
# Postgres container is used only to keep local development cheap. The roles are deliberately
# NOT superusers and are granted rights on their own database only, so the ownership boundary
# still holds: no service can read another service's data.
#
# Runs once, on first initialisation of the postgres volume. Wipe it with
# `docker compose down -v` to force a re-run.

set -euo pipefail

SERVICE_DB_PASSWORD="${SERVICE_DB_PASSWORD:-password}"

create_service_db() {
	local service="$1"
	local role="pavilion-${service}-db-user"
	local database="pavilion-${service}-db"

	echo "  -> ${database} (owner: ${role})"

	# CREATEDB is granted so `prisma migrate dev` can create its shadow database when a developer
	# authors a new migration. The containers themselves only ever run `migrate deploy`, which
	# needs no shadow database — this is purely a local-development affordance.
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
		CREATE ROLE "${role}" WITH LOGIN CREATEDB PASSWORD '${SERVICE_DB_PASSWORD}';
		CREATE DATABASE "${database}" OWNER "${role}";
		GRANT ALL PRIVILEGES ON DATABASE "${database}" TO "${role}";
	EOSQL

	# Prisma migrations create tables in `public`, so the role needs to own that schema too.
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${database}" <<-EOSQL
		ALTER SCHEMA public OWNER TO "${role}";
		GRANT ALL ON SCHEMA public TO "${role}";
	EOSQL
}

echo "Creating Pavilion service databases..."

for service in auth post profile newsletter; do
	create_service_db "$service"
done

echo "Pavilion service databases ready."
