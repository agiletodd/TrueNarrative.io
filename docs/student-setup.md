# TrueNarrative.io: pre-class setup

Complete this guide **before the first session**. You will work from your own fork of a real product feedback application: create products, gather ideas, vote, and discuss suggestions while learning how the frontend, API, and database fit together.

This guide preserves the original README's classroom onboarding workflow. The [project README](../README.md) provides the overview; [architecture.md](architecture.md) explains the implementation.

## What you need first

- **Node.js 22 or newer**, including npm. The backend's development script uses Node's built-in `--watch` mode, and the locked React Router dependency requires Node 20 or newer.
- **Git** and a GitHub account so you can fork and clone the repository.
- A code editor, such as Visual Studio Code.
- Internet access to install packages.

You do **not** need to install a database server: local development uses a SQLite file. The frontend uses Vite, React, and Tailwind CSS; the backend uses Express and Prisma. Authentication uses email/password and JWTs; there is no Google or Facebook login.

Check the installed tools:

```bash
node --version
npm --version
git --version
```

On Windows, if PowerShell blocks `npm.ps1` under its execution policy, use `npm.cmd` in place of `npm` in this guide. You do not need to change the system execution policy.

## 1. Fork and clone

Open [agiletodd/TrueNarrative.io](https://github.com/agiletodd/TrueNarrative.io) and select **Fork** to create a copy in your GitHub account.

Clone **your fork** for classroom work, replacing `YOUR_USERNAME`:

```bash
git clone https://github.com/YOUR_USERNAME/TrueNarrative.io.git
cd TrueNarrative.io
```

Keep using your fork for class contributions. The direct-clone command in the project README is suitable for exploring the application independently.

## 2. Install dependencies

Run from the repository root:

```bash
npm run setup
```

This runs `npm ci` three times: for the root development scripts, for `backend/`, and for `frontend/`. The backend and frontend are independent npm packages, each with its own `package-lock.json`, so `npm ci` installs exactly the locked versions. Use `npm ci` (or `npm run setup`) rather than `npm install` unless you mean to change dependencies.

The backend pins both Prisma Client and the Prisma CLI to **6.10.0**; the CLI is installed with the other dependencies, so a separate or global Prisma installation is unnecessary.

Recent npm versions run a dependency's install scripts only when the project allows them. The allowed packages are listed under `allowScripts` in each `package.json` (Prisma's engine download, and esbuild for Vite); bcrypt's optional source build is skipped because it ships prebuilt binaries.

## 3. Create local settings files

Copy both templates. From the root, use either shell:

**PowerShell:**

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

**Bash / macOS / Linux:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

For an existing checkout, inspect your current `.env` files before copying over them.

### Backend: `backend/.env`

```dotenv
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-locally-generated-random-value"
PORT=4000
```

Generate a random JWT signing value locally:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the result into `JWT_SECRET`, replacing the placeholder. Keep it private; do not copy it into commits, screenshots, or classroom messages. The backend checks its settings at startup and stops with a message naming the problem if `DATABASE_URL` is missing or `JWT_SECRET` is missing, still the placeholder, or shorter than 32 characters.

`DATABASE_URL` is resolved relative to the Prisma schema directory, so `file:./dev.db` creates `backend/prisma/dev.db`. `PORT` is optional and defaults to 4000. A shell variable with the same name takes precedence over the file.

### Frontend: `frontend/.env` (optional)

Nothing is required for local development. The Vite dev server forwards requests beginning with `/api` to the backend at `http://localhost:4000`, so the browser talks to a single origin and no CORS configuration is involved. The template documents two optional settings: `API_PROXY_TARGET`, if your backend runs on a different port, and `VITE_API_URL`, used by production builds whose API lives on another origin. Vite exposes `VITE_` values to browser code, so this file must never contain secrets. Both `.env` files are ignored by Git.

## 4. Initialize the database and start the app

From the root:

```bash
npm run db:setup
```

This pushes the Prisma schema into a local SQLite database (`backend/prisma/dev.db`) and generates Prisma Client. Run it again after changing `schema.prisma`. The checked-in migration history targets PostgreSQL for deployment; local SQLite development uses `db push` instead of migrations.

There is no automatic sample data: `backend/prisma/seed.js` is empty. You will create your own account and product in the next step.

Start both services from the root and leave the terminal running:

```bash
npm run dev
```

Concurrently runs the backend (labelled `api`) and the frontend (labelled `web`) together. The backend restarts automatically when its source files change; Vite hot-reloads the frontend. Use **Ctrl+C** to stop both.

Open:

- Frontend: the `Local:` URL Vite prints, normally <http://localhost:5173>. If that port is busy, Vite picks the next free one (5174, …), and the app still works because API calls go through Vite's proxy.
- Backend health: <http://localhost:4000/health>

### Running the services separately

For separate terminal output, run each service in its own terminal from the repository root:

```bash
npm --prefix backend run dev
```

```bash
npm --prefix frontend run dev
```

## 5. Create an account and verify the application

### Check the services

1. Open the home page and confirm the TrueNarrative.io interface appears.
2. Open `/health` on the backend. It should return JSON containing `"status":"ok"` and a timestamp. This checks the HTTP server only; it does not query the database.
3. Continue with account and product creation below to verify database writes and frontend/API communication.

### Register through the API

The registration endpoint is implemented, but the browser `/register` route is commented out and the navigation login link is hidden. Create a local learning account through the API, then visit `/login` directly.

With both services running, open a **new terminal at the repository root**. Run the following command in PowerShell or Bash, replacing the email and password placeholders with values for your local learning account:

```bash
node --input-type=module -e "
const response = await fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'learner@example.test',
    password: 'replace-with-your-own-local-password',
    firstname: 'Local',
    lastname: 'Learner'
  })
});
const body = await response.json();
console.log({
  status: response.status,
  userId: body.user?.id,
  error: body.error ?? body.message
});
"
```

Expect HTTP **201** and a numeric `userId`. This program deliberately prints neither the returned token nor your password. If the account already exists, log in with it rather than registering it again. Registration creates a `USER` account; there is no automatic admin account or public role-promotion endpoint.

### Exercise a complete feedback flow

1. Visit `/login` on the frontend (for example <http://localhost:5173/login>) directly. Sign in with your local account and confirm you reach **My Products** at `/dashboard`.
2. Add a product with a name and description. Confirm it appears, then edit it to check the owner workflow.
3. Copy the product's public URL. Open it in a private browser window to try the guest workflow.
4. Submit an idea with a title and description, then open its detail page. Opening the detail page initializes the guest identifier needed for voting.
5. Vote up, then down, and confirm counts change. Repeating the same direction returns a duplicate-vote message.
6. Enter a guest display name and comment. Reload and confirm the idea, vote totals, and comment persist.

The detail-page step matters: a fresh guest browser can submit ideas immediately, but the board list does not initialize its guest identifier. Voting from the list before visiting a detail page can fail. Status filters exist, but there is no status-changing workflow yet. These limitations are described in [the architecture guide](architecture.md#known-limitations-and-follow-up-work).

## Project orientation

| Location | Responsibility |
| --- | --- |
| `backend/app.js` | Express configuration, CORS, API mounting, health endpoint |
| `backend/server.js` | Backend HTTP entry point |
| `backend/src/` | Routes, controllers, middleware, utilities, and tests |
| `backend/prisma/` | Database schema, PostgreSQL migration, local SQLite file after setup |
| `frontend/src/main.jsx` | React entry point, AuthProvider, router, notifications |
| `frontend/src/router.jsx` | Public and protected browser routes |
| `frontend/src/components/` | Product, idea, auth, admin, and shared UI components |

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `npm` is blocked by PowerShell | Use `npm.cmd` instead of `npm`; keep the remaining arguments unchanged. |
| Prisma CLI is missing or asks to install another version | Rerun `npm run setup`; the matching CLI is a backend dependency. From `backend/`, `npx prisma` uses that installed version. |
| Backend exits with `Invalid backend configuration` | Fix the settings it lists in `backend/.env`; see step 3. |
| Schema/provider or missing-table error | Confirm the SQLite `DATABASE_URL`, then rerun `npm run db:setup` from the root. |
| Prisma prints only `Schema engine error` on a new SQLite database | If your shell defines `RUST_LOG`, temporarily set it to `info` and retry (`$env:RUST_LOG='info'` in PowerShell; `export RUST_LOG=info` in Bash). Prisma 6.10 can hide the missing-database diagnostic when native logs are filtered. Client generation also requires access to Prisma's engine-download host. |
| API requests fail in the browser | Confirm both services are running and the backend health URL responds. If you created `frontend/.env`, leave `VITE_API_URL` unset for local development, and make `API_PROXY_TARGET` match the backend's port. |
| `/register` is unavailable or no login link appears | Use API registration and open `/login` directly, as shown above. |
| First guest vote fails | Open an idea detail page to initialize `guestId`, then retry. |
| Port is occupied | Vite moves to the next free port on its own. For the backend, stop the other process or change `PORT` in `backend/.env` and set `API_PROXY_TARGET` in `frontend/.env` to match, then restart both services. |

If you get stuck, ask a teammate or instructor. Share the command you ran, the error message, and your Node/npm versions. Remove tokens, passwords, and environment-file contents from anything you share.

## Pre-class checklist

- [ ] Forked the repository into your GitHub account.
- [ ] Cloned your fork locally.
- [ ] Installed Node.js, npm, and Git and checked their versions.
- [ ] Installed dependencies with `npm run setup`.
- [ ] Created both `.env` files and replaced the JWT placeholder.
- [ ] Initialized SQLite and generated Prisma Client using the documented `db:setup` command.
- [ ] Started both services with `npm run dev`.
- [ ] Opened the frontend and checked the backend health response.
- [ ] Registered through the API and logged in through `/login`.
- [ ] Created a product and verified an idea, vote, and comment persist after reload.
