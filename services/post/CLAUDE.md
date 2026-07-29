# Post Service

Post CRUD plus image uploads to S3/MinIO. A downstream consumer — identity arrives via headers, never JWTs.

See root `../../CLAUDE.md` for stack, conventions, response envelope, request flow, and boundaries. Post-specific notes below.

Requires PostgreSQL **and an S3-compatible store** (AWS S3 or MinIO). Build uses `tsc-alias`.

## Endpoints (`/api/v1`)

- `POST   /post`              — create; `multipart/form-data`, optional `image` field + `content`
- `GET    /post/:postId`      — fetch one
- `GET    /post/user/:userId` — cursor pagination (`?limit`, `?cursor`)
- `PUT    /post/:postId`      — update content only
- `DELETE /post/:postId`      — delete

Author is always `req.userId` (from `requestHeaderHandler`). Update/delete enforce ownership via a `where: { id, authorId: req.userId }` clause — a mismatch surfaces as Prisma `P2025` → 404.

## Uploads

- `upload.middleware.ts` — multer memory storage, 5 MB cap, JPEG/PNG/WebP only.
- `utils/s3.ts` — `uploadObject` stores under a random `uuid` key and returns the public URL; `forcePathStyle: true` for MinIO. Create requires content **or** image.

## Validation (`schemas/post.schema.ts`, Zod)

- `content` ≤ 500 chars, non-empty. `postId`/`cursor` must be uuid v4. `limit` 1–100, default 10.
- Pagination is `take: limit + 1` to detect the next page, popping the extra and returning its id as `cursor`.

## Config

- S3 vars are required (endpoint/region have dev defaults).
- `Post` model: `id`, `content?`, `imageUrl?`, `authorId`, `likedBy String[]`, `deleted`, timestamps. Note: `likedBy` and the `deleted` soft-delete flag exist but no endpoint uses them yet (delete is a hard delete).
