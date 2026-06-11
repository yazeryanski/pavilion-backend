# Pavilion Backend

Pavilion - A Social Network application, based on a microservice architecture.

## Architecture
- services/
  - auth/ - Auth Service
  - post/ - Post service
  - profile/ - User Profile Service 
- shared/
  - types/
  - utils/

## Stack for each service (base)
Node.js / Express
TypeScript (strict mode)
Winston request/response logging

Each service has its own CLAUDE.md

## Commands
No global commands (yet). Do not run all services at once, instead check how to run for a specific service in its own CLAUDE.md.

## Base Rules (all services)
- All API responses use the shape:
  - success: { success: true, data: T }
  - error:   { success: false, data: string }  // error message
- Implemented by `responseHandler` middleware — use it, never build
  responses manually.

## Boundaries (Do NOT)
- Each service owns its own database — never query another service's DB directly.
- Never import code from another service's directory.
- Inter-service calls go through 
  - direct HTTP for request/response; 
  - RabbitMQ for async work (notifications, fan-out, anything that shouldn't block the response).
- Never add JWT validation in the services (it's only in auth)
- New routes must sit behind requestHeaderHandler — never read
  x-user-id from raw headers; use req.userId.
- Shared code (types, utils) lives in shared/ — import from there, never duplicate across services.

## Commits
[SERVICE] feat/fix: description

### examples:
[AUTH] feat: add a new header to request
[POST] fix: the post delete logic
[PROFILE] feat: add avatar support

## READ WHEN
- I'm asking to do some job at specific service: services/$service/CLAUDE.md
- I'm asking to setup a new service: agent_docs/new-service-creation.md

## Request Flow
Client → API Gateway/upstream service → sets x-user-id, x-service-name, x-request-id headers → service

Each service endpoint gets x-user-id / x-service-name / x-request-id headers, and all services have a middleware named `requestHeaderHandler` which transforms them into request properties (req.userId, req.serviceName, req.requestId)

The `auth` service issues JWTs; the `post` and `profile` services do **not** validate JWTs themselves — they trust the `x-user-id` header injected by the upstream layer