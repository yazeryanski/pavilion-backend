# Profile Service

User profile management. A downstream consumer — identity arrives via headers, never JWTs.

See root `../../CLAUDE.md` for stack, conventions, response envelope, request flow, and boundaries. Profile-specific notes below.

## Endpoints (`/api/v1`)

- `GET    /profile/:userId`                   — fetch one (404 if missing)
- `POST   /profile`                           — create from `userId` + `name` in body
- `PUT    /profile/:userId`                   — update `name` + `avatar`
- `POST   /profile/:userId/friends`           — add `friendId` (body) to `friendIds`
- `DELETE /profile/:userId/friends/:friendId` — remove `friendId` from `friendIds`

## Behavior

- `userId` is the auth-service user id (uuid), stored as the `Profile.userId` unique FK — not `req.userId`. Create/update/friends take it from body/params, so there is no ownership check here yet.
- Create maps `P2002` → 409 "Profile already exists"; update maps `P2025` → 404.
- Validation (`schemas/common.schema.ts`, Zod): `userId`/`friendId` must be uuid; all strings run through `sanitize-html`. `name` is optional and **defaults to `Anonymous`** (`DEFAULT_USER_NAME` in `src/config.ts`) — omitting it on update overwrites the stored name.
- Friends: add is idempotent and rejects self-add (400); both return the updated profile. `friendIds` is what the **newsletter** service reads (over HTTP) to fan a published post out to an author's friends.

## Config

- Only `DATABASE_URL` beyond node basics.
- `Profile` model: `id` cuid, `userId` unique, `name?`, `avatar?`, `friendIds String[]`, timestamps.
