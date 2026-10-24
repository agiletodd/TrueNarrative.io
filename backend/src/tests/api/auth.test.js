import { describe, it, expect, beforeEach } from "vitest";
import { api, resetDatabase, registerUser, signToken, prisma } from "../support/helpers.js";

beforeEach(resetDatabase);

describe("POST /api/auth/register", () => {
  it("creates a USER and returns a token and the user without the password", async () => {
    const res = await api()
      .post("/api/auth/register")
      .send({ email: "new@example.test", password: "a-strong-password", firstname: "Ada" })
      .expect(201);

    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: "new@example.test", firstname: "Ada", role: "USER" });
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("stores a bcrypt hash, not the plain password", async () => {
    await api()
      .post("/api/auth/register")
      .send({ email: "hash@example.test", password: "a-strong-password" })
      .expect(201);

    const stored = await prisma.user.findUnique({ where: { email: "hash@example.test" } });
    expect(stored.password).not.toBe("a-strong-password");
    expect(stored.password).toMatch(/^\$2[aby]\$/);
  });

  it("ignores a role sent by the client", async () => {
    const res = await api()
      .post("/api/auth/register")
      .send({ email: "sneaky@example.test", password: "a-strong-password", role: "ADMIN" })
      .expect(201);

    expect(res.body.user.role).toBe("USER");
  });

  it.each([
    ["email", { password: "a-strong-password" }],
    ["password", { email: "missing@example.test" }],
  ])("rejects a registration without %s", async (_field, body) => {
    const res = await api().post("/api/auth/register").send(body).expect(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it("rejects a duplicate email", async () => {
    await registerUser({ email: "taken@example.test" });

    await api()
      .post("/api/auth/register")
      .send({ email: "taken@example.test", password: "another-password" })
      .expect(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token for valid credentials and records the login time", async () => {
    const { user } = await registerUser({ email: "login@example.test", password: "right-password" });

    const res = await api()
      .post("/api/auth/login")
      .send({ email: "login@example.test", password: "right-password" })
      .expect(200);

    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ id: user.id, email: "login@example.test" });
    expect(res.body.user).not.toHaveProperty("password");
    const stored = await prisma.user.findUnique({ where: { id: user.id } });
    expect(stored.lastLogin).toBeInstanceOf(Date);
  });

  it("rejects a wrong password", async () => {
    await registerUser({ email: "login@example.test", password: "right-password" });

    await api()
      .post("/api/auth/login")
      .send({ email: "login@example.test", password: "wrong-password" })
      .expect(401);
  });

  it("gives an unknown email the same response as a wrong password", async () => {
    await registerUser({ email: "login@example.test", password: "right-password" });

    const wrongPassword = await api()
      .post("/api/auth/login")
      .send({ email: "login@example.test", password: "wrong-password" });
    const unknownEmail = await api()
      .post("/api/auth/login")
      .send({ email: "nobody@example.test", password: "wrong-password" });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it.todo("rejects a login without a password with 400 (currently 500; Phase 4, S6)");
});

describe("protected endpoints", () => {
  // GET /api/products/mine stands in for every route behind requireAuth.
  const protectedRequest = () => api().get("/api/products/mine");

  it("rejects a request without a token", async () => {
    await protectedRequest().expect(401);
  });

  it("rejects a malformed token", async () => {
    await protectedRequest().set("Authorization", "Bearer not-a-jwt").expect(401);
  });

  it("rejects a token signed with another secret", async () => {
    const { user } = await registerUser();
    const forged = signToken({ userId: user.id, role: "ADMIN" }, {}, "an-attacker-chosen-secret-value");

    await protectedRequest().set("Authorization", `Bearer ${forged}`).expect(401);
  });

  it("rejects an expired token", async () => {
    const { user } = await registerUser();
    const expired = signToken({ userId: user.id, role: "USER" }, { expiresIn: -10 });

    await protectedRequest().set("Authorization", `Bearer ${expired}`).expect(401);
  });

  it("rejects a valid token for a user who no longer exists", async () => {
    const { user, auth } = await registerUser();
    await prisma.user.delete({ where: { id: user.id } });

    await protectedRequest().set("Authorization", auth).expect(401);
  });

  it("accepts a valid token", async () => {
    const { auth } = await registerUser();

    await protectedRequest().set("Authorization", auth).expect(200);
  });
});
