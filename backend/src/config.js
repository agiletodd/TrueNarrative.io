// Loads backend/.env and validates the environment once, at startup.
// Modules that need configuration import it from here instead of reading
// process.env directly, so a missing setting fails fast with a clear message.
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

// The value shipped in .env.example; it must be replaced before use.
const PLACEHOLDER_SECRET = "replace-with-a-locally-generated-random-value";

// Browser origins allowed to call the API cross-origin. Local development
// normally goes through the Vite proxy (same origin), so these matter for
// deployed frontends and for a frontend configured with VITE_API_URL.
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "https://frontend-truenarrativeio-production.up.railway.app",
  "https://www.truenarrative.io",
  "https://truenarrative.io",
];

function loadConfig(env) {
  const problems = [];

  if (!env.DATABASE_URL) {
    problems.push("DATABASE_URL is not set.");
  }

  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    problems.push("JWT_SECRET is not set.");
  } else if (jwtSecret === PLACEHOLDER_SECRET) {
    problems.push("JWT_SECRET still has the placeholder value from .env.example.");
  } else if (jwtSecret.length < 32) {
    problems.push("JWT_SECRET must be at least 32 characters.");
  }

  const port = Number(env.PORT ?? 4000);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    problems.push(`PORT must be a valid port number (got "${env.PORT}").`);
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid backend configuration:\n  - ${problems.join("\n  - ")}\n` +
        "Copy backend/.env.example to backend/.env and fill it in (see docs/student-setup.md)."
    );
  }

  const corsOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_CORS_ORIGINS;

  return { port, jwtSecret, corsOrigins };
}

export const config = loadConfig(process.env);
