# Architecture and implementation notes

This guide describes the checked-in implementation. It is a reference for following requests through the application and identifying focused improvements; hosting domains in source code do not establish the state of a live deployment.

## Application boundaries

The root [package.json](../package.json) declares two npm workspaces. Its `dev` script uses Concurrently to run the backend and frontend scripts. There is no root build, test, or lint script.

### Frontend

- [main.jsx](../frontend/src/main.jsx) mounts React Strict Mode, the authentication provider, toast notifications, and React Router's provider.
- [router.jsx](../frontend/src/router.jsx) nests pages inside `App` and `Layout`; `Layout` supplies navigation and the content area. `RequireAuth` guards product-management screens and `RequireAdmin` guards `/admin`.
- Components are grouped by feature under [components/](../frontend/src/components/). Product and idea forms are separate from list/detail views; voting controls are shared between idea cards and details.
- [AuthContext.jsx](../frontend/src/context/AuthContext.jsx) holds the current user, authentication flags, loading state, and login/register/logout actions. It restores the user and token from local storage.
- [api.js](../frontend/src/lib/api.js) creates an Axios client using `VITE_API_URL`; request interceptors retrieve the stored token and attach a bearer header.
- [hooks/](../frontend/src/hooks/) contains API setup, vote submission, and guest-ID generation. Other data is managed in component state; there is no shared query cache or external state store.
- [vite.config.js](../frontend/vite.config.js) enables React, maps `@` to `src`, and opens the browser during development. It does not configure an API proxy.

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

[server.js](../backend/server.js) calls `dotenv.config()` and starts the listener on `PORT` or 4000. [app.js](../backend/app.js) configures JSON parsing, a fixed CORS allowlist, a static directory, feature routers mounted at `/api`, and `/health`.

Routes choose middleware and controller functions. Controllers contain request validation, ownership checks, response formatting, and direct Prisma queries. Several controllers and the authentication middleware each instantiate their own Prisma Client; there is no shared database-client module or separate service/repository layer.

The configured Express static directory resolves to a root-level `public/`, which is absent. The frontend's actual public assets live in `frontend/public/`, and Vite builds into `frontend/dist/`. Express does not currently serve that build or provide SPA fallback routing.

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

[swapPrismaProvider.js](../backend/scripts/swapPrismaProvider.js) rewrites the datasource provider in the tracked schema: `production` selects PostgreSQL; other values select SQLite.

- `dev:dbsetup` and `dev:sqlite` set development mode for the provider-switch command, use `prisma db push`, and generate the client. `dev:sqlite` then starts the HTTP server. Backend `dev` delegates to it.
- Backend `start` sets production mode for the switch, runs `prisma migrate deploy`, generates the client, and starts the server. The `cross-env` assignment applies to the switch command before `&&`, rather than setting the environment for the entire chain.
- The [migration lock](../backend/prisma/migrations/migration_lock.toml) and [initial SQL migration](../backend/prisma/migrations/20250620132613_init/migration.sql) target PostgreSQL. They are not a SQLite migration workflow.
- [seed.js](../backend/prisma/seed.js) is empty and no seed command is configured.

The backend `migrate` script passes `--env-file=.env` to Prisma, which is not an option of the matching Prisma 6 `migrate dev` command. Prisma loads `.env` itself. That script also conflicts with the local SQLite provider and PostgreSQL migration history; the student guide uses `db:setup` instead.

## Authentication and authorization

[authController.js](../backend/src/controllers/authController.js) hashes passwords using bcrypt with cost 10. Registration always assigns `USER`. Login and registration return a seven-day JWT containing a user ID and role, plus a user object formatted without the password field.

[requireAuth.js](../backend/src/middleware/requireAuth.js) verifies tokens and loads the current user from the database. Protected endpoints return 401 for missing/invalid credentials. Optional authentication silently continues if a token is invalid. [roleMiddleware.js](../backend/src/middleware/roleMiddleware.js) checks the database-loaded user's role for `ADMIN`. The schema also defines `MODERATOR`, but no route grants it separate powers.

Frontend guards provide navigation behavior; backend checks enforce access. Product writes check ownership. Reading a product by numeric ID requires authentication without requiring ownership, while GUID lookup is public.

The browser stores both token and user in local storage. Logout removes those values locally; there is no server-side token revocation, refresh-token flow, password-reset flow, or email verification implementation.

## Environment and service operation

| Variable | Consumer | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | Prisma schema/client/CLI | Local `file:./dev.db`, or a PostgreSQL connection string for the production-provider path |
| `JWT_SECRET` | JWT helper | Signing/verification key captured when the module is imported |
| `PORT` | Backend listener | Optional HTTP port, default 4000 |
| `NODE_ENV` | Provider-switch script | Selects PostgreSQL only when exactly `production`; development scripts set it for the switch |
| `VITE_API_URL` | Browser Axios client | Backend origin; Vite reads it into the frontend bundle |

See [student-setup.md](student-setup.md) for commands that preload backend settings. They use Node 22+. Backend scripts fetch the pinned Prisma CLI through `npx`. Loading the environment before module evaluation matters: static imports run before the body of `server.js`, and the JWT helper otherwise can capture its hardcoded fallback before `dotenv.config()` loads the file.

The CORS allowlist in `app.js` includes `http://localhost:5173` and hardcoded hosting domains. It is not configurable through an environment variable. Requests without an `Origin` header are accepted. This controls browser cross-origin access and is not authentication.

## Validation and deployment configuration

- Backend `test` runs Vitest with V8 coverage and text/HTML reporters; `test:watch` runs interactive Vitest. The two test files exercise user-response formatting and JWT generation only. The JWT test assumes the hardcoded default secret, rather than isolating its configuration.
- Frontend `build` runs `npm install --legacy-peer-deps` before `vite build`. That install can change lockfiles, so the build is not an installation-free validation step. `preview` serves the Vite build locally.
- Frontend `start` invokes `npx serve -s dist`, although `serve` is not declared as a dependency. The backend Prisma CLI is also fetched at runtime, but every backend script explicitly selects `prisma@6.10.0`, matching the exact `@prisma/client` dependency and both backend-related lockfiles. CLI fetching and engine downloads require network access when not cached.
- No CI workflow, container configuration, automated browser test suite, frontend test script, or hosting manifest is checked in. The provider switch, backend `start`, and hardcoded domains indicate deployment intent, not a reproducible deployment procedure.

### Railway client-generation failure

A deployment log showed migrations completing, followed by `prisma generate` failing to find `@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js`. The require stack pointed to an npm-downloaded CLI, while the repository had no version constraint on that CLI. This is consistent with CLI/client version drift. Backend commands now pin the CLI and client to 6.10.0 so a rebuild cannot silently select a different CLI release. This change does not modify the schema or migration history. Deployment recovery still requires rebuilding the backend with the updated manifest, lockfile, and scripts.

An isolated local check reproduced the same missing-module error with CLI 6.19.0 and Client 6.10.0. With both at 6.10.0, PostgreSQL client generation and initialization succeeded using production-only dependencies. This validates the failing generation step without connecting to the deployed database; a successful Railway deployment remains the final check.

## Known limitations and follow-up work

These observations are documented separately from onboarding. The Prisma version pins address deployment tooling; the application limitations below remain unchanged.

| Area | Evidence in the current implementation | Focused follow-up |
| --- | --- | --- |
| JWT configuration | `utils/jwt.js` captures a hardcoded fallback at import; `server.js` loads dotenv after static imports evaluate | Load and validate configuration before imports; require a configured secret; test custom-secret startup. The guide preloads `.env` as a local workaround. |
| Admin response fields | `adminController.js` queries `topUsers` with relation counts but no scalar-field selection, then returns full records, including password hashes | Select only intended response fields and add an API response test. |
| Account onboarding | Registration route and login navigation are commented out, despite a working registration API and login page | Complete browser onboarding and add an end-to-end account/product walkthrough. |
| Guest voting | `Ideas.jsx` uses `useVote` without initializing `useGuestId`; the detail page initializes it, but `useVote` reads storage before that initialization on its first render | Initialize identity before vote submission and test a fresh session. Opening the detail page allows a subsequent render to read the ID. |
| Guest trust and exposure | Vote-status responses accept a caller-supplied guest ID; public comment responses include guest IDs; there is no guest verification, server-side rate limiting, or abuse-control middleware | Define the guest trust model, minimize returned identity fields, and test abuse cases before relying on guest IDs for integrity. |
| Incomplete status workflow | `Idea.status` is free text; the UI filters three named statuses, but no update endpoint exists | Define allowed transitions and ownership rules before implementing status changes. |
| Session and request setup | Local storage holds tokens; `setupAxiosInterceptors()` adds an interceptor on repeated hook mounts | Review token-storage tradeoffs and make interceptor lifecycle explicit. |
| Response consistency | Idea creation and vote responses omit list fields such as `commentCount`; components replace list records with these responses | Define consistent response shapes or refetch/merge deliberately; test behavior after mutations. |
| Data access and validation | Multiple Prisma clients; varying validation and error shapes; no pagination on list endpoints | Evaluate a shared client, consistent validation/error contracts, and bounded list queries. |
| Reproducibility | Prisma CLI is pinned but fetched by `npx`; `serve` remains unpinned; frontend build reinstalls dependencies; provider switching edits the tracked schema | Consider installing the matched Prisma CLI during the build, pin `serve`, separate install/build, and test each database workflow. |
| Coverage | Only two utility tests; no authorization, API/database, or browser tests | Prioritize owner isolation, admin response filtering, guest first-use, and vote constraint tests. |

For portfolio presentation, useful next steps are a screenshot of an actual local board, CI for tests and build, and a completed browser onboarding path. A deliberate license choice would clarify reuse; no license file is currently present. These are proposed improvements, not implemented capabilities.
