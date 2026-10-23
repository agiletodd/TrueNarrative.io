# Engineering Maturity Roadmap

This is the requirements brief for maturing TrueNarrative.io into a reliable, well-engineered portfolio and teaching application. It is the source of truth for scope and acceptance criteria.

- Progress, findings, decisions, and validation results: [engineering-progress.md](engineering-progress.md)
- Work proceeds one phase at a time; a phase is complete only when its acceptance criteria are met.

**The objective is engineering maturity, not adding complexity or features simply to appear sophisticated.** The application also serves as a hands-on developer education project; that purpose is preserved throughout.

---

## Phase 1: Engineering Foundation

**Objective:** make the repository predictable, maintainable, reproducible, and easy for another developer to work with.

### 1. Review the existing architecture

Inspect root, frontend, and backend package configuration; React components and routing; Express routes, controllers, and middleware; Prisma schema, migrations, and database configuration; authentication and authorization; environment variable handling; existing tests and documentation.

Identify unnecessary complexity, inconsistent patterns, technical debt, and reliability concerns. Do not perform a large architectural rewrite.

### 2. Improve development scripts

A developer should be able to: clone, install dependencies, configure local environment variables, initialize a local database, run the application, execute tests, and build the frontend.

- Remove dependency installation from the frontend build command after resolving dependency compatibility issues.
- Ensure package versions and lockfiles are consistent; prefer reproducible installation.
- Simplify database setup where practical.
- Preserve SQLite support for local development.
- Preserve existing PostgreSQL support without assuming it is fully deployed or tested.
- Avoid runtime dependency installation during builds or application startup where feasible.
- Ensure secrets are never committed.

### 3. Improve basic code quality

Address straightforward issues: duplicated code, inconsistent naming, fragile configuration, missing error handling, unnecessary dependencies, poor separation of responsibilities, incorrect or misleading comments, missing environment-variable validation. Do not introduce unnecessary abstractions or frameworks.

### Phase 1 acceptance criteria

- [x] Dependencies install reproducibly.
- [x] Application starts locally.
- [x] Database initialization works.
- [x] Existing application functionality remains intact.
- [x] Frontend builds successfully.
- [x] Setup instructions match the actual implementation.

---

## Phase 2: Automated Testing & Continuous Integration

**Objective:** demonstrate that the application works reliably and that changes can be validated automatically.

### 1. Expand automated testing (Vitest)

- **Authentication:** registration, login, invalid credentials, missing authentication, invalid or expired tokens, protected endpoint access.
- **Products:** create, retrieve, update, delete, ownership enforcement, unauthorized modifications.
- **Ideas:** create, retrieve, product associations, input validation, error handling.
- **Voting:** upvotes and downvotes, duplicate votes, switching direction, authenticated voting, guest voting, invalid requests.
- **Comments:** create, retrieve, authenticated and guest contributions, invalid input.
- **Administration:** admin-only access, role-based permissions, dashboard aggregation where practical.

### 2. Use an isolated test database

Tests never modify development or production databases. Tests are independent, repeatable, have predictable state and reliable cleanup, and need no external services unless clearly documented.

### 3. Add GitHub Actions

Runs on pull requests and pushes to `main`: checkout, supported Node.js, install dependencies, isolated test database, backend tests, frontend build, clear failure reporting. Consider dependency caching.

### 4. Add minimal frontend testing

Test a few important behaviors, prioritizing meaningful interactions over snapshots. If a frontend test framework would add disproportionate complexity, document the tradeoff and focus on API integration tests.

### Phase 2 acceptance criteria

- [ ] Meaningful API integration tests exist.
- [ ] Tests run against isolated data.
- [ ] Tests pass locally.
- [ ] GitHub Actions workflow is configured.
- [ ] CI performs a reproducible installation, testing, and frontend build.
- [ ] The workflow reports meaningful failures.
- [ ] CI behavior that cannot be verified locally or by an actual run is marked unverified.

---

## Phase 3: Complete Core Application Workflows

**Objective:** make TrueNarrative usable end to end without calling APIs manually or editing the database. Complete existing functionality; do not invent unrelated features.

1. **Authentication:** users can register from the browser, log in, log out, navigate appropriately based on auth state, and understand failures. Review how browser sessions are maintained; preserve the architecture unless correctness or security requires change.
2. **Product management:** authenticated users can create, view, edit, and delete their own products and share public feedback boards. Ownership is enforced by the backend.
3. **Feedback lifecycle:** an authorized product owner can change an idea's status (`New`, `Done`, `Retired`). Valid statuses enforced, unauthorized changes rejected, changes persist, frontend updates, filters keep working. No workflow engine.
4. **Feedback interactions:** visitors can submit ideas, view ideas and discussions, comment, vote where permitted, and see whether operations succeed or fail. Review loading, empty, success, and error states.
5. **Initial experience:** a first-time, non-technical user can see how to create a product and share a board.

### Phase 3 acceptance criteria

- [ ] Registration and login work from the browser.
- [ ] Product management works end to end.
- [ ] Feedback submission, commenting, and voting work.
- [ ] Authorized product owners can manage idea statuses.
- [ ] Permission checks work correctly.
- [ ] Core workflows have automated test coverage.
- [ ] Existing functionality is preserved.

---

## Phase 4: Security, Reliability & Operational Quality

**Objective:** address meaningful engineering risks without enterprise-scale infrastructure.

1. **Authentication and authorization review:** password hashing, JWT generation/validation, expiration, secret management, browser token storage, roles, resource ownership. Fix straightforward vulnerabilities; for tradeoff-heavy changes, document options and choose the simplest secure approach.
2. **Input validation:** required fields, types, length limits, identifiers, email formats, allowed statuses, malformed requests. Use existing libraries; don't leak implementation details.
3. **Standardized API errors:** consistent status codes and response structure for validation, unauthorized, forbidden, not found, conflict, and unexpected errors; usable by the frontend.
4. **Abuse and security risks:** login/registration abuse, anonymous ideas, guest comments, guest voting, untrusted content, CORS, query safety. Add lightweight protections such as rate limiting where warranted. Guest browser IDs are not verified identities.
5. **Database reliability:** relationships, unique constraints, cascades, migrations, consistency, transactions for multi-step operations. Document changes and migration implications.
6. **Operational behavior:** startup configuration, health endpoints, logging, graceful shutdown, env validation, unexpected-error handling — proportional to the app's size.

### Phase 4 acceptance criteria

- [ ] Authentication and authorization have been reviewed.
- [ ] Significant vulnerabilities are addressed or explicitly documented.
- [ ] API validation and errors are consistent.
- [ ] Public endpoints have reasonable abuse protections.
- [ ] Database operations preserve data integrity.
- [ ] Security-sensitive behaviors have automated tests.
- [ ] Startup and failure behavior are predictable.

---

## Phase 5: Demo Experience & Portfolio Presentation

**Objective:** make the project easy for a developer, interviewer, or engineering leader to explore and understand.

1. **Demo data:** a repeatable, clearly fictional local seed (product, ideas in several statuses, comment threads, votes, fictional owner). Safe to repeat or with explicit reset instructions. Never seed predictable credentials into production.
2. **First-run experience:** a documented demo workflow covering registration/login, product creation, public sharing, idea submission, voting and commenting, status management, and admin functionality if configured.
3. **README.md:** concise overview, implemented functionality, stack, verified architecture diagram, getting started, testing, demo data, key engineering decisions, doc links, screenshots only if real assets exist. No claims of a public deployment that doesn't exist.
4. **docs/architecture.md:** components, frontend/backend responsibilities, API design, data relationships, auth, significant decisions, tradeoffs, known limitations — the *how* and the *why*.
5. **Educational value:** keep `docs/student-setup.md` accurate; consider a concise `docs/learning-guide.md` tracing a real feature React component → API request → Express route → controller → Prisma → database, plus a few exercises.
6. **Portfolio polish:** review as a senior interviewer would. Capture real screenshots into an assets directory if tooling allows; otherwise list the screens worth capturing manually.

### Phase 5 acceptance criteria

- [ ] A new developer can follow the documented setup.
- [ ] Demo data can be created reliably.
- [ ] Core workflows are demonstrable.
- [ ] README and architecture documentation match the codebase.
- [ ] Educational setup material is preserved.
- [ ] The repository is suitable for sharing as a portfolio project.

---

## Global engineering principles

1. **Prefer simplicity.** No microservices, Kubernetes, messaging, or ornamental patterns.
2. **Real quality over appearances.** No tools, badges, or abstractions added for show.
3. **Preserve working behavior.** Avoid unrelated changes and rewrites.
4. **Meaningful tests.** Observable behavior, edge cases, security boundaries, correctness.
5. **Keep the educational architecture understandable.**
6. **Be transparent about limitations.** Don't invent features, deployments, coverage, metrics, or production readiness.
7. **Protect data and secrets.**
8. **Technology consistency.** React, Express, Prisma, Vitest unless a change is clearly justified.
9. **Avoid unnecessary dependencies.** Only packages that solve concrete problems.
10. **Verify the work.** Run tests and builds; report failures accurately.

## Working rules

- Inspect before changing; complete and validate each phase before the next.
- Record progress, validation results, blockers, and remaining steps in [engineering-progress.md](engineering-progress.md) so work can resume without repetition.
- Do not modify or connect to production infrastructure, deploy, push to GitHub, or create commits automatically.
- Avoid destructive operations against existing databases or user data.

## Final deliverables

1. Executive summary
2. Phase-by-phase results
3. Files changed (new, modified, removed)
4. Testing results (counts, build results)
5. Security improvements
6. Remaining limitations
7. Verified developer setup commands
8. Portfolio readiness assessment
9. Recommended next steps (only those with meaningful value)

**Success means a small but credible, thoroughly engineered application — not a large or unnecessarily complicated one.**
