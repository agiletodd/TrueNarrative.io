# Engineering Progress

Working record for the [engineering maturity roadmap](engineering-roadmap.md). It captures the baseline assessment, the planned work per phase, decisions, validation results, and blockers, so work can resume without repeating completed steps.

| Phase | Status | Board item |
| --- | --- | --- |
| 1. Engineering foundation | Complete (commit `37e1aa3`) | #1 |
| 2. Testing & CI | Complete — awaiting review (CI run on GitHub unverified) | #2 |
| 3. Core workflows | Not started | #3 |
| 4. Security & reliability | Not started | #4 |
| 5. Demo & portfolio | Not started | #5 |

Status values: *Not started*, *In progress*, *Complete* (all acceptance criteria verified), *Blocked*.

Phases are also tracked as work items on a local SignalNorth board (project `truenarrative`; columns To do → In progress → Verifying → Done). An item moves to Verifying once its acceptance criteria are met and validated, and to Done after the owner has reviewed (and committed) the work. The board is a personal local tool and is not required to work on this repository; this file remains the detailed record.

---

## Baseline (2026-10-23, commit `6f3214f`)

### Validation baseline

| Check | Command | Result |
| --- | --- | --- |
| Backend tests | `npx vitest run` in `backend/` | 2 files, 2 tests pass (utility tests only) |
| Frontend build | `npx vite build` in `frontend/` | Builds (351 kB JS) — run without the script's embedded `npm install` |
| Local runtime | — | Not exercised yet; no `.env` files or `dev.db` present |
| Local environment | — | Node 24.22.0, npm 11.19.1 (docs require Node 22+) |

### What is already in good shape

- `app.js` / `server.js` separation makes the Express app importable for HTTP-level tests.
- Clear feature folders (routes → controllers on the backend; components by feature on the frontend).
- bcrypt password hashing; product writes check ownership server-side; vote uniqueness enforced by composite unique constraints.
- Existing README, `architecture.md`, and `student-setup.md` are accurate and candid about limitations. They are a foundation to update, not replace.

### Findings by phase

Each finding was verified by reading the code. File references are relative to the repository root.

#### Phase 1 — foundation

| # | Finding | Evidence |
| --- | --- | --- |
| F1 | Three lockfiles in an npm-workspaces repo. npm uses only the root lockfile for workspaces, so `backend/` and `frontend/` lockfiles drift silently. | `package-lock.json`, `backend/package-lock.json`, `frontend/package-lock.json` |
| F2 | Both workspaces depend on the root package (`"truenarrative-monorepo": "file:.."`), a circular self-reference with no purpose. | `backend/package.json`, `frontend/package.json` |
| F3 | Frontend `build` runs `npm install --legacy-peer-deps`; build mutates `node_modules` and possibly lockfiles. | `frontend/package.json` |
| F4 | Prisma CLI is fetched at runtime via `npx --yes prisma@6.10.0` in every backend script instead of being a pinned dev dependency. | `backend/package.json` |
| F5 | `swapPrismaProvider.js` rewrites the tracked `schema.prisma` on every start, so running production scripts locally leaves a dirty working tree. | `backend/scripts/swapPrismaProvider.js` |
| F6 | Backend `dev` re-runs `db push` + `generate` on every start; `nodemon` is installed but unused, so there is no reload. | `backend/package.json` |
| F7 | `migrate` script is broken (`--env-file` is not a Prisma 6 option; targets PostgreSQL history while the schema says SQLite). | `backend/package.json` |
| F8 | `dotenv.config()` runs after static imports, so `jwt.js` captures its hardcoded `"supersecret"` fallback unless env is preloaded. No env validation anywhere. | `backend/server.js`, `backend/src/utils/jwt.js` |
| F9 | Six separate `PrismaClient` instances; `login` calls `prisma.$disconnect()` after every request. | controllers, `requireAuth.js` |
| F10 | Unused or unnecessary dependencies: `c8` (coverage uses `@vitest/coverage-v8`), `nodemon` (unused), `uuid` (browser `crypto.randomUUID` suffices). Frontend `start` uses an undeclared `npx serve`. | package files |
| F11 | `express.static` points to a nonexistent root `public/`. | `backend/app.js` |
| F12 | CORS allowlist hardcoded, contains a duplicate and non-origin entries (`frontend.railway.internal`); not configurable by env. | `backend/app.js` |
| F13 | `frontend/dist/` and `coverage/` outputs are not ignored at the root; root `.gitignore` covers only `node_modules/`. | `.gitignore`, `frontend/.gitignore` |
| F14 | No root `test` / `build` scripts; `seed.js` is empty. | `package.json`, `backend/prisma/seed.js` |
| F15 | `useApi()` registers a new Axios interceptor on every component mount (interceptor accumulation). | `frontend/src/hooks/useApi.js`, `frontend/src/lib/api.js` |
| F16 | JWT unit test relies on the hardcoded default secret. | `backend/src/tests/jwt.test.js` |

#### Phase 2 — testing & CI

| # | Finding |
| --- | --- |
| T1 | Only two utility unit tests; no HTTP/API, authorization, or database tests. |
| T2 | No isolated test database configuration; tests would use whatever `DATABASE_URL` is set. |
| T3 | No CI workflow. |
| T4 | No frontend test tooling. |

#### Phase 3 — core workflows

| # | Finding | Evidence |
| --- | --- | --- |
| W1 | `/register` route commented out; login link hidden in the navbar; "Create Account" link commented out. | `router.jsx`, `Navbar.jsx`, `LoginForm.jsx` |
| W2 | No API or UI to change idea status; status is free text. | `ideaController.js`, `schema.prisma` |
| W3 | Fresh guest cannot vote from the board: `useVote` reads `guestId` from storage, but only the detail page creates it. | `useVote.js`, `Ideas.jsx`, `_IdeaDetail.jsx` |
| W4 | After voting on the board, the card is replaced by the vote response, which lacks `commentCount`. New ideas lack vote/comment counts. | `Ideas.jsx`, `ideaVoteController.js` |
| W5 | `RequireAuth` ignores `loading`, so a hard refresh on a protected page redirects to `/login`, then to `/dashboard`, losing the original destination. | `RequireAuth.jsx`, `LoginForm.jsx` |
| W6 | Logout does not navigate; an expired token (401) is never handled — the UI stays "logged in" while requests fail. | `Navbar.jsx`, `AuthContext.jsx` |
| W7 | Many failures only `console.error` (idea submit, comment submit, product load/delete, board load) — users see nothing. | Ideas, IdeaDetail, Products components |
| W8 | Comment author renders as `"null null"` when a registered user has no names. | `_IdeaDetail.jsx` |
| W9 | Home page has no call to action; a new user has no visible path to start. | `pages/Home.jsx` |

#### Phase 4 — security & reliability

| # | Finding | Severity | Evidence |
| --- | --- | --- | --- |
| S1 | Admin dashboard `topUsers` returns full user records, **including password hashes**. | High | `adminController.js` |
| S2 | JWT secret falls back to a hardcoded public value. | High | `utils/jwt.js` |
| S3 | `GET /api/products/:id` has no ownership check (any user can read any product by ID). | Medium | `productController.js` |
| S4 | Public comment and idea responses expose `guestId` values, letting anyone impersonate a guest's vote identity. | Medium | `ideaController.js`, `ideaCommentController.js` |
| S5 | No rate limiting on login, registration, or anonymous writes. | Medium | routes |
| S6 | No length limits or format validation (email, password length, titles, comments). `express-validator` is installed but unused. | Medium | controllers |
| S7 | Unvalidated or nonexistent IDs cause 500s (e.g. `POST /api/ideas/abc`, voting on a missing idea, `GET /api/votes/abc`). | Low | controllers |
| S8 | Vote and registration use check-then-write; concurrent requests hit unique constraints and return 500. | Low | `ideaVoteController.js`, `authController.js` |
| S9 | Inconsistent error shapes (`{ error }` vs `{ message }`). | Low | controllers, middleware |
| S10 | Registration reveals whether an email exists (`"User already exists"`). Accepted tradeoff candidate; document. | Low | `authController.js` |
| S11 | Deleting a user cascades to ideas/votes/comments on *other owners'* products. | Design | `schema.prisma` |
| S12 | No graceful shutdown; `/health` does not check the database; no central error handler. | Ops | `server.js`, `app.js` |
| S13 | Tokens in `localStorage` (XSS-readable), 7-day expiry, no revocation. Tradeoff to document. | Design | `AuthContext.jsx` |

#### Phase 5 — demo & portfolio

| # | Finding |
| --- | --- |
| P1 | No demo data; seed file is empty. |
| P2 | No `docs/learning-guide.md`, screenshots, or license file. |
| P3 | README and docs describe the current incomplete state; they must be updated as phases land. |

---

## Plan by phase

Checkboxes track implementation. Acceptance criteria live in the [roadmap](engineering-roadmap.md).

### Phase 1 — Engineering foundation

- [x] Independent npm packages: removed workspaces and the `file:..` self-dependencies; each package keeps its own lockfile (D6). (F1, F2)
- [x] `prisma@6.10.0` is a pinned backend dependency; scripts use the local CLI. (F4)
- [x] Frontend build is `vite build` only, installs without `--legacy-peer-deps`; `serve` pinned as a dependency for `start`. (F3, F10)
- [x] Provider switch takes an explicit argument and runs only in `start`; SQLite stays committed (D1). (F5)
- [x] `db:setup` = `prisma db push` (one-time); `dev` = `node --watch server.js`; broken `migrate` script removed (D2). (F6, F7)
- [x] `src/config.js` loads `backend/.env` by path and validates `DATABASE_URL`, `JWT_SECRET` (present, not the placeholder, ≥ 32 chars), `PORT`; the `"supersecret"` fallback is gone. (F8, S2)
- [x] `src/db.js` shared Prisma client; per-request `$disconnect` removed. (F9)
- [x] Removed `c8`, `nodemon`, `cross-env`, `uuid` (now `crypto.randomUUID`); removed dead static path; `CORS_ORIGINS` env with the previous valid origins as default, dropping the duplicate and non-origin entries. (F10–F12)
- [x] Vite dev proxy for `/api`: no CORS or fixed port needed locally, which also resolves the clash with SignalNorth on :5173.
- [x] Root scripts `setup`, `db:setup`, `dev`, `test`, `build`; single root `.gitignore` covering `dist/`, `coverage/`, `.env*`, `*.db`. (F13, F14)
- [x] One Axios client and interceptor registered at module load; `useApi` hook removed. (F15)
- [x] Tests get their own `JWT_SECRET`/`DATABASE_URL` via `vitest.config.js`; JWT tests check signing, verification and forged-token rejection. (F16)
- [x] `npm audit fix` (non-breaking) in all three packages; remaining advisories need major upgrades (see follow-ups).
- [x] README, `student-setup.md`, `architecture.md` updated to the new commands and verified against a clean copy.

**Follow-ups moved to later phases**

- Phase 2: upgrade Vitest 3 → current major (critical/moderate advisories in the dev-only test runner).
- Phase 3: confirmed W5 in the browser — a full page load of `/products/new` redirects to `/login`, then `/dashboard`.
- Phase 4: `serve` → `compression` denial-of-service advisory affects the deployed frontend runtime; npm's only suggested fix is a downgrade. Options: serve the build from Express, override `compression`, or another static server. Tailwind 3 → 4 (build-time advisory) to be evaluated separately.
- Not verified: `prisma migrate deploy` against PostgreSQL and the Railway deployment itself (no database connection or deployment was made). Railway services must run `npm ci` in each package directory, as before.

### Phase 2 — Testing & CI

- [x] Supertest API integration tests against the real Express app and a real SQLite database: 6 files, 81 tests across auth, products, ideas, votes, comments, admin. (T1)
- [x] Isolated test database: global setup recreates `backend/prisma/test.db` (`db push --force-reset`, guarded to refuse any other URL) and generates Prisma Client; every test clears all tables; test settings override `.env`; files run serially. (T2)
- [x] Authorization boundaries: missing/malformed/forged/expired tokens, deleted users, owner-only product update/delete, author-only comment edit/delete, admin role read from the database rather than the token claim, client-supplied `role`/`ownerId`/`status` ignored.
- [x] **S1 fixed early** (pulled forward from Phase 4): the regression test reproduced password hashes in the admin dashboard response; `topUsers` now uses `select`.
- [x] Known gaps recorded as `it.todo` (backend: S3, S6, S7 ×2) and one `it.fails` (frontend: W5), each naming its finding.
- [x] Vitest 3 → 5 (clears the backend advisories); backend `npm audit`: 0 vulnerabilities.
- [x] Frontend tests (D3): Vitest + React Testing Library + jsdom; idea form submission/validation, sign-in success and failure through the real AuthContext (HTTP client mocked), route guard. (T4)
- [x] GitHub Actions `ci.yml`: PRs and pushes to `main`; Node 22; npm cache keyed on all three lockfiles; `npm run setup`, backend tests, frontend tests, build; read-only permissions; 15-minute timeout. (T3)
- [x] Node minimum made precise: `^22.13.0 || >=24.0.0` (Vitest 5 needs 22.12+, jsdom 29 needs 22.13+; jsdom 30 would need 22.22+, so 29 was chosen). `engines` and docs updated.
- [x] README, `architecture.md`, `student-setup.md` updated.

**Unverified:** the workflow has not run on GitHub (nothing pushed). Its steps were run locally under Node 22.19 / npm 10.9 (the npm generation Actions uses), in a fresh copy. Vitest's automatic GitHub annotations for failures are expected but unconfirmed.

### Phase 3 — Core workflows

- [ ] Enable browser registration, login link, logout navigation, 401 handling, and auth-aware redirects. (W1, W5, W6)
- [ ] Idea status endpoint (owner-only, allowed values `New`/`Done`/`Retired`) plus owner UI controls. (W2)
- [ ] Guest ID available before first vote; consistent idea response shape after votes and submissions. (W3, W4)
- [ ] Visible success/error/loading/empty states across products, ideas, and comments. (W7, W8)
- [ ] Home page "get started" path. (W9)
- [ ] Tests for each workflow added or extended.

### Phase 4 — Security & reliability

- [ ] Fix password-hash leak (S1); owner check on product read (S3); stop exposing `guestId` (S4).
- [ ] Validation with `express-validator` (already a dependency) and length limits. (S6, S7)
- [ ] Consistent error format `{ error: { code, message, details? } }` (final shape decided in phase) and central error handler. (S9, S12)
- [ ] Rate limiting on auth and anonymous write endpoints. (S5) — see decision D4
- [ ] Upserts / constraint-violation handling for votes and registration. (S8)
- [ ] Schema review: `Idea.status` constraint, user-deletion behavior, migration implications documented. (S11)
- [ ] Graceful shutdown, DB-aware health/readiness check, request logging proportional to size. (S12)
- [ ] Document token storage and enumeration tradeoffs. (S10, S13)
- [ ] Security-sensitive tests.

### Phase 5 — Demo & portfolio

- [ ] Idempotent fictional demo seed for development only, refusing to run when `NODE_ENV=production`. (P1)
- [ ] Documented demo walkthrough.
- [ ] README, `architecture.md`, `student-setup.md` updated to final state; `learning-guide.md` added. (P2, P3)
- [ ] Screenshots captured from the running app if possible; otherwise a list of screens to capture.

---

## Decisions

Decisions are recorded here when made. Proposed defaults are listed for the open ones.

| ID | Question | Status | Proposed / chosen approach |
| --- | --- | --- | --- |
| D1 | How to support SQLite locally and PostgreSQL in production without mutating the tracked schema? | Decided (Phase 1) | SQLite stays committed. Only the deployment `start` script switches the provider (explicit `postgresql` argument), inside the disposable container. Development scripts never touch the schema. A second schema file was rejected: two schemas would drift. |
| D2 | Migrations vs `db push` for SQLite | Decided (Phase 1) | `db push` for local SQLite (one-time `db:setup`, not on every start); PostgreSQL migrations remain the deployment path. Documented in `architecture.md`. |
| D3 | Frontend test framework | Decided (Phase 2) | Vitest + React Testing Library + jsdom: four dev dependencies, configured in `vite.config.js`, no snapshot tests or extra matcher libraries. Three files of interaction tests. |
| D4 | Rate limiting implementation | Open (Phase 4) | `express-rate-limit` with in-memory store; document that it is per-process. |
| D6 | Workspaces or independent packages? | Decided (Phase 1, owner) | Independent packages with their own lockfiles. Railway builds each service from its own directory using that directory's lockfile, so the per-package lockfiles are the deployed source of truth. |
| D5 | Token storage | Open (Phase 4) | Likely keep bearer tokens (no CSRF surface), shorten expiry, handle 401 cleanly, and document the XSS tradeoff vs httpOnly cookies. |

## Validation log

### Phase 1 (2026-10-23)

Run in a clean copy of the working tree (no `node_modules`, `.env`, or database), on Node 24.22.0 / npm 11.19.1, after the final dependency updates:

| Step | Command | Result |
| --- | --- | --- |
| Install | `npm run setup` | 26 / 212 / 270 packages from the three lockfiles; no unreviewed install scripts |
| Config validation | `node server.js` with the placeholder or a short `JWT_SECRET` | Exits with "Invalid backend configuration" naming the problem |
| Database | `npm run db:setup` | `dev.db` created, Prisma Client generated |
| Tests | `npm test` | 2 files, 4 tests passed |
| Build | `npm run build` | Built (350 kB JS); no install during build |
| Run | `npm run dev` | API on :4000; Vite on :5174 because SignalNorth held :5173 |
| API smoke (via Vite proxy) | scripted, 19 checks | All passed: register, login, bad password 401, missing token 401, product create/list/edit/delete, public board, guest idea, guest up/duplicate 409/switch vote, user vote, guest comment, idea detail, list counts, admin 403 for USER, health |
| CORS | `curl` with `Origin` headers | `http://localhost:5173` allowed; other origins get no CORS headers |
| Browser | Chrome, manual | Login → dashboard → create product → public board render; no console errors |
| Production path (partial) | `swapPrismaProvider.js postgresql` + `prisma generate` | Client generated for PostgreSQL; `migrate deploy` not run (no database) |

The same tests and build also pass in the real working tree.

### Phase 2 (2026-10-23)

| Step | Environment | Result |
| --- | --- | --- |
| Backend tests | Node 24.22 (working tree) | 8 files: 85 passed, 4 todo |
| Frontend tests | Node 24.22 (working tree) | 3 files: 6 passed, 1 expected fail (W5) |
| CI steps (`npm run setup`, backend tests, frontend tests, build) | Fresh copy, Node 22.19.0 / npm 10.9.3 | All passed; no engine warnings after the jsdom change |
| Failure reporting | Fresh copy, one assertion deliberately broken | `npm test` exit code 1; output names the test, expected and received values |
| Backend coverage | `test:coverage` | 84.5% statements, 89.5% branches (lowest: `config.js` error branches, which run before the app loads) |
| GitHub Actions run | — | Not run (not pushed) |

## Deployment observations

- **2026-10-23, after commit `37e1aa3`:** the deployed backend (Railway, Node 24.10) completed the provider switch, `prisma migrate deploy`, and `prisma generate`, then exited at startup: `JWT_SECRET must be at least 32 characters`. The production secret is shorter than the new minimum. Fix (owner action, not code): set a 32+ character random `JWT_SECRET` in the service's variables and redeploy; existing sessions will be signed out. This is the first real confirmation that the Phase 1 deploy path works up to application startup.

## Blockers

_(none)_
