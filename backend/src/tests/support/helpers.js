// Shared helpers for API tests. Tests go through the real Express app and a
// real (test) database, so they exercise routing, middleware, and queries.
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../app.js";
import { prisma } from "../../db.js";

export const api = () => request(app);

// Child tables first, so foreign keys never block a delete.
export async function resetDatabase() {
  await prisma.ideaVote.deleteMany();
  await prisma.ideaComment.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

let userCounter = 0;

// Registers a user through the API and returns { user, token, auth }.
// `auth` is the Authorization header value for supertest's .set().
export async function registerUser({ role = "USER", ...fields } = {}) {
  userCounter += 1;
  const res = await api()
    .post("/api/auth/register")
    .send({
      email: `user${userCounter}@example.test`,
      password: "correct-horse-battery",
      firstname: "Test",
      lastname: `User${userCounter}`,
      ...fields,
    })
    .expect(201);

  let { user, token } = res.body;
  if (role !== "USER") {
    // There is no API for changing roles, so promote directly in the database
    // and log in again to get a token for the new role.
    await prisma.user.update({ where: { id: user.id }, data: { role } });
    const login = await api()
      .post("/api/auth/login")
      .send({ email: user.email, password: fields.password ?? "correct-horse-battery" })
      .expect(200);
    ({ user, token } = login.body);
  }

  return { user, token, auth: `Bearer ${token}` };
}

export async function createProduct(auth, fields = {}) {
  const res = await api()
    .post("/api/products")
    .set("Authorization", auth)
    .send({ name: "Test Product", description: "A product under test", ...fields })
    .expect(201);
  return res.body;
}

export async function createIdea(productId, { auth, ...fields } = {}) {
  let req = api().post(`/api/ideas/${productId}`);
  if (auth) req = req.set("Authorization", auth);
  const res = await req
    .send({ title: "An idea", description: "Details of the idea", ...fields })
    .expect(201);
  return res.body;
}

// Signs a token directly, for tests of expired or forged tokens.
export function signToken(payload, options = {}, secret = process.env.JWT_SECRET) {
  return jwt.sign(payload, secret, options);
}

export { prisma };
