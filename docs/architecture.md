# Architecture and implementation notes

This guide describes the checked-in implementation. It is a reference for following requests through the application and identifying focused improvements; hosting domains in source code do not establish the state of a live deployment.

## Application boundaries

The backend and frontend are independent npm packages, each with its own `package.json` and lockfile, matching how they are deployed as separate services. The root [package.json](../package.json) holds only development scripts: `setup` (runs `npm ci` in all three), `db:setup`, `dev` (Concurrently runs both services), `test`, and `build`. There is no lint script.

### Frontend

- [main.jsx](../frontend/src/main.jsx) mounts React Strict Mode, the authentication provider, toast notifications, and React Router's provider.
- [router.jsx](../frontend/src/router.jsx) nests pages inside `App` and `Layout`; `Layout` supplies navigation and the content area. `RequireAuth` guards product-management screens and `RequireAdmin` guards `/admin`.
- Components are grouped by feature under [components/](../frontend/src/components/). Product and idea forms are separate from list/detail views; voting controls are shared between idea cards and details.
- [AuthContext.jsx](../frontend/src/context/AuthContext.jsx) holds the current user, authentication flags, loading state, and login/register/logout actions. It restores the user and token from local storage.
- [api.js](../frontend/src/lib/api.js) creates the single Axios client. Its base URL is `VITE_API_URL` when set, otherwise the page's own origin. One request interceptor, registered when the module loads, attaches the stored token as a bearer header.
- [hooks/](../frontend/src/hooks/) contains vote submission and guest-ID generation. Other data is managed in component state; there is no shared query cache or external state store.
- [vite.config.js](../frontend/vite.config.js) enables React, maps `@` to `src`, opens the browser during development, and proxies `/api` to the backend (`API_PROXY_TARGET`, default `http://localhost:4000`). The proxy gives the browser one origin in development, so local work does not depend on CORS or on which port Vite chooses.

| Browser path | View and access |
| --- | --- |
| `/` | Public home page |
| `/login` | Login form, reachable directly; navigation link is hidden |
| `/dashboard` | Signed-in user's products |
| `/products/new` | Authenticated product creation |
| `/products/:id` | Authenticated product edit form |
| `/products/:guid/ideas` | Public product feedback board |
| `/products/:guid/ideas/:ideaId` | Public idea detail and discussion |
| `/admin` | Admin dashboard, guarded by authentication and role |

`RegisterForm.jsx` exists, but its `/register` route is commented out. API registration remains active.

### Backend

[config.js](../backend/src/config.js) loads `backend/.env` and validates the environment once; modules that need settings import it, so a missing or placeholder secret stops startup with a clear message instead of falling back to a default. [server.js](../backend/server.js) starts the listener on the configured port. [app.js](../backend/app.js) configures CORS from the configured origin list, JSON parsing, feature routers mounted at `/api`, and `/health`.

Routes choose middleware and controller functions. Controllers contain request validation, ownership checks, response formatting, and direct Prisma queries. All database access goes through one Prisma Client exported by [db.js](../backend/src/db.js); there is no separate service or repository layer.

Express serves only the API. Vite builds the frontend into `frontend/dist/`, and the frontend's `start` script serves that build with `serve -s dist`, which falls back to `index.html` for client-side routes.

## API reference

Paths below include the `/api` mount prefix. Required authentication uses the bearer-token header. Optional authentication attaches a user if verification succeeds; a missing or invalid token proceeds as a guest. Numeric `productId` and `ideaId` values differ from a product's public `guid`.

| Method | Path | Access and behavior |
| --- | --- | --- |
| GET | `/health` | Public process health JSON; no database query |
| POST | `/api/auth/register` | Public; email/password required, creates a `USER`, returns token and formatted user |
| POST | `/api/auth/login` | Public; validates password, updates `lastLogin`, returns token and formatted user |
| GET | `/api/products/mine` | Required auth; filters by current owner, includes ideas |
| GET | `/api/products/:id` | Required auth; fetches by numeric ID, includes ideas; no owner check |
| GET | `/api/products/guid/:guid` | Public; fetches product and ideas by UUID |
| POST | `/api/products` | Required auth; name and description required, assigns current user and generates UUID |
| PUT | `/api/products/:id` | Required auth; owner check, updates name and description |
| DELETE | `/api/products/:id` | Required auth; owner check, cascading deletion, returns 204 |
| GET | `/api/ideas/:productId` | Optional auth; newest-first ideas with derived vote and comment counts |
| POST | `/api/ideas/:productId` | Optional auth; title/description required, anonymous or user-associated idea |
| GET | `/api/idea/:ideaId` | Optional auth; idea with vote totals and newest-first comments |
| POST | `/api/votes/:ideaId` | Optional auth; `voteType` normalized to `UP`/`DOWN`, needs user or body `guestId` |
| GET | `/api/votes/:ideaId` | Optional auth; current vote and totals, query `guestId` for guests |
| GET | `/api/ideas/:ideaId/comments` | Public; newest-first comments with selected user display fields |
| POST | `/api/comments` | Optional auth; numeric body `ideaId` and nonblank `content`; guests also need `guestId` and `guestName` |
| PUT | `/api/comments/:commentId` | Optional auth; nonblank `content` and matching authenticated author ID |
| DELETE | `/api/comments/:commentId` | Optional auth; matching authenticated author ID, returns 204 |
| GET | `/api/admin/dashboard` | Required auth plus `ADMIN`; totals, recent records, grouped counts, top records |

Express uses its default non-strict trailing-slash behavior; routes declared with a trailing slash also accept the forms shown above. Comment editing/deletion endpoints exist, but the detail UI only lists and creates comments. Guest comment management is not implemented: handlers compare `userId`, not guest IDs, and an unauthenticated request does not match the stored `null` author ID.

For voting, submitting the same direction twice returns HTTP 409 with `reason: "duplicate_vote"`; the opposite direction updates the record. There is no vote-removal endpoint. Submission responses return `upvotes` and `downvotes`; vote-status responses use `thumbsUp` and `thumbsDown`.

## Database model

The source of truth is [schema.prisma](../backend/prisma/schema.prisma).

| Model | Relationships and constraints |
| --- | --- |
| `User` | Unique email; password hash; optional profile fields; `Role`; products, ideas, votes, comments; creation/update/login timestamps |
| `Product` | Required owner; unique public `guid`; name and optional schema-level description; many ideas |
| `Idea` | Required product, optional user; title, description, free-text status defaulting to `New`; many votes/comments |
| `IdeaVote` | Required idea, optional user/guest identifier, `UP` or `DOWN`; unique `(ideaId, userId)` and `(ideaId, guestId)` pairs |
| `IdeaComment` | Required idea and content; optional user, guest identifier, and guest display name |

All declared foreign keys use `onDelete: Cascade`. Deleting a product removes its ideas and their votes/comments. Deleting a user at the database level also cascades to owned products and authored ideas, votes, and comments; there is no user-deletion API.

The vote model's unique constraints support separate authenticated and guest identities. The controller chooses one identity, but the schema does not enforce exactly one of `userId` and `guestId` being present. Browser-generated guest IDs can be changed or cleared, so these constraints do not enforce one vote per real person.

### Local SQLite and PostgreSQL scripts

The committed schema uses SQLite. Prisma does not allow the datasource provider to come from an environment variable, so deployment switches it explicitly:

- Backend `db:setup` runs `prisma db push`, which creates or updates the local SQLite database and regenerates Prisma Client. Local development does not use migrations.
- Backend `dev` runs `node --watch server.js`; it no longer re-pushes the schema on every start.
- Backend `start` (deployment) runs [swapPrismaProvider.js](../backend/scripts/swapPrismaProvider.js) `postgresql`, then `prisma migrate deploy`, `prisma generate`, and the server. The switch edits `schema.prisma` inside the deployment container; running `start` locally would leave that tracked file modified (restore with `node scripts/swapPrismaProvider.js sqlite`).
- The [migration lock](../backend/prisma/migrations/migration_lock.toml) and [initial SQL migration](../backend/prisma/migrations/20250620132613_init/migration.sql) target PostgreSQL. Creating a new PostgreSQL migration requires a PostgreSQL database and is not part of the local workflow.
- [seed.js](../backend/prisma/seed.js) is empty and no seed command is configured.

## Authentication and authorization

[authController.js](../backend/src/controllers/authController.js) hashes passwords using bcrypt with cost 10. Registration always assigns `USER`. Login and registration return a seven-day JWT containing a user ID and role, plus a user object formatted without the password field.

[requireAuth.js](../backend/src/middleware/requireAuth.js) verifies tokens and loads the current user from the database. Protected endpoints return 401 for missing/invalid credentials. Optional authentication silently continues if a token is invalid. [roleMiddleware.js](../backend/src/middleware/roleMiddleware.js) checks the database-loaded user's role for `ADMIN`. The schema also defines `MODERATOR`, but no route grants it separate powers.

Frontend guards provide navigation behavior; backend checks enforce access. Product writes check ownership. Reading a product by numeric ID requires authentication without requiring ownership, while GUID lookup is public.

The browser stores both token and user in local storage. Logout removes those values locally; there is no server-side token revocation, refresh-token flow, password-reset flow, or email verification implementation.

## Environment and service operation

| Variable | Consumer | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | Prisma client/CLI; validated by `config.js` | Local `file:./dev.db`, or a PostgreSQL connection string for the deployment path |
| `JWT_SECRET` | `config.js` → JWT helper | Required signing key, at least 32 characters; startup fails if missing or left as the template placeholder |
| `PORT` | Backend listener | Optional HTTP port, default 4000 |
| `CORS_ORIGINS` | `config.js` → CORS middleware | Optional comma-separated browser origins; defaults to `http://localhost:5173` and the project's hosting domains |
| `VITE_API_URL` | Browser Axios client (build time) | Optional backend origin for builds whose API is on another origin; unset means same origin |
| `API_PROXY_TARGET` | Vite dev server only | Optional; where `/api` is proxied in development, default `http://localhost:4000` |

`config.js` loads `backend/.env` by path, so scripts work from any working directory, and variables already set in the environment (including the test settings in `vitest.config.js`) take precedence over the file.

CORS only matters when a browser page on another origin calls the API, which is the deployed setup; local development uses the Vite proxy. Requests from origins outside the list get no CORS headers, so the browser blocks the response. Requests without an `Origin` header are accepted. CORS controls browser cross-origin reads and is not authentication. The API uses bearer tokens rather than cookies, so cross-origin credentials are not enabled.

## Validation and deployment configuration

- The root `setup` script runs `npm ci` for the root, backend, and frontend lockfiles. Recent npm versions run dependency install scripts only for packages listed under `allowScripts` in each `package.json`: Prisma (engine download and client generation) and esbuild. bcrypt's source build is denied because it ships prebuilt binaries; older npm versions ignore the field.
- Backend `test` runs Vitest with test-only `JWT_SECRET` and `DATABASE_URL` values (`src/tests/support/testEnv.js`). A global setup recreates `prisma/test.db` with `prisma db push --force-reset` (and refuses any other database URL), and each test clears all tables first. API tests in `src/tests/api/` use Supertest against the real Express app, so routing, middleware, validation, and queries are all exercised. Test files run one at a time because they share one SQLite file. `test:coverage` adds a V8 coverage report.
- Frontend `test` runs Vitest in jsdom with React Testing Library. Tests render real components and context and mock only the HTTP client.
- Frontend `build` runs `vite build` only; it does not install dependencies. `preview` serves the build locally, and `start` serves it with the pinned `serve` dependency.
- The Prisma CLI is a pinned backend dependency (6.10.0, matching `@prisma/client`), so builds and startup do not download it.
- [ci.yml](../.github/workflows/ci.yml) runs on pull requests and pushes to `main`: Node 22, `npm ci` for all three lockfiles (cached), backend tests, frontend tests, frontend build. It needs no services or secrets. No container configuration, end-to-end browser suite, or hosting manifest is checked in. The provider switch, backend `start`, and default hosting domains indicate deployment intent, not a reproducible deployment procedure.

### Railway client-generation failure

A deployment log showed migrations completing, followed by `prisma generate` failing to find `@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js`. The require stack pointed to an npm-downloaded CLI, while the repository had no version constraint on that CLI. This is consistent with CLI/client version drift. Backend commands now pin the CLI and client to 6.10.0 so a rebuild cannot silently select a different CLI release. This change does not modify the schema or migration history. Deployment recovery still requires rebuilding the backend with the updated manifest, lockfile, and scripts.

An isolated local check reproduced the same missing-module error with CLI 6.19.0 and Client 6.10.0. With both at 6.10.0, PostgreSQL client generation and initialization succeeded using production-only dependencies. This validates the failing generation step without connecting to the deployed database; a successful Railway deployment remains the final check.

## Known limitations and follow-up work

These observations are documented separately from onboarding. Work to address them is tracked in the [engineering roadmap](engineering-roadmap.md) and [progress log](engineering-progress.md).

| Area | Evidence in the current implementation | Focused follow-up |
| --- | --- | --- |
| Account onboarding | Registration route and login navigation are commented out, despite a working registration API and login page | Complete browser onboarding and add an end-to-end account/product walkthrough. |
| Guest voting | `Ideas.jsx` uses `useVote` without initializing `useGuestId`; the detail page initializes it, but `useVote` reads storage before that initialization on its first render | Initialize identity before vote submission and test a fresh session. Opening the detail page allows a subsequent render to read the ID. |
| Guest trust and exposure | Vote-status responses accept a caller-supplied guest ID; public comment responses include guest IDs; there is no guest verification, server-side rate limiting, or abuse-control middleware | Define the guest trust model, minimize returned identity fields, and test abuse cases before relying on guest IDs for integrity. |
| Incomplete status workflow | `Idea.status` is free text; the UI filters three named statuses, but no update endpoint exists | Define allowed transitions and ownership rules before implementing status changes. |
| Session handling | Local storage holds tokens; an expired token is not detected by the frontend, which stays signed in while requests fail | Review token-storage tradeoffs and handle 401 responses. |
| Response consistency | Idea creation and vote responses omit list fields such as `commentCount`; components replace list records with these responses | Define consistent response shapes or refetch/merge deliberately; test behavior after mutations. |
| Validation and errors | Varying validation and error shapes (`error` vs `message`); no length limits; no pagination on list endpoints | Consistent validation/error contracts and bounded list queries. |
| Dependencies | `npm audit` reports advisories that need major upgrades: `serve`'s `compression` dependency (frontend runtime) and Tailwind 3's `postcss-selector-parser` (build time) | Replace or patch the `serve` path; evaluate Tailwind 4 separately. |
| Coverage | API integration tests cover the existing endpoints; frontend tests cover a few components; no end-to-end browser tests | Add tests alongside each workflow change; known gaps are `todo`/expected-failure tests. |

For portfolio presentation, useful next steps are a screenshot of an actual local board, CI for tests and build, and a completed browser onboarding path. A deliberate license choice would clarify reuse; no license file is currently present. These are proposed improvements, not implemented capabilities.
