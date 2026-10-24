import { describe, it, expect, beforeEach } from "vitest";
import {
  api,
  resetDatabase,
  registerUser,
  createProduct,
  createIdea,
  signToken,
} from "../support/helpers.js";

beforeEach(resetDatabase);

const dashboard = (auth) => {
  const req = api().get("/api/admin/dashboard");
  return auth ? req.set("Authorization", auth) : req;
};

describe("GET /api/admin/dashboard", () => {
  it("requires authentication", async () => {
    await dashboard().expect(401);
  });

  it.each(["USER", "MODERATOR"])("forbids the %s role", async (role) => {
    const { auth } = await registerUser({ role });

    await dashboard(auth).expect(403);
  });

  it("decides admin access from the database, not the token's role claim", async () => {
    // requireAuth reloads the user, and ensureAdmin reads that record, so a
    // validly signed token that claims ADMIN does not make a USER an admin.
    const { user } = await registerUser();
    const claimsAdmin = signToken({ userId: user.id, role: "ADMIN" });

    await dashboard(`Bearer ${claimsAdmin}`).expect(403);
  });

  it("returns platform totals and breakdowns to an admin", async () => {
    const admin = await registerUser({ role: "ADMIN" });
    const owner = await registerUser();
    const product = await createProduct(owner.auth);
    const idea = await createIdea(product.id, { auth: owner.auth });
    await createIdea(product.id);
    await api().post(`/api/votes/${idea.id}`).send({ voteType: "UP", guestId: "g1" }).expect(200);
    await api().post(`/api/votes/${idea.id}`).send({ voteType: "DOWN", guestId: "g2" }).expect(200);
    await api()
      .post("/api/comments")
      .send({ ideaId: idea.id, content: "Hi", guestName: "G", guestId: "g1" })
      .expect(201);

    const res = await dashboard(admin.auth).expect(200);

    expect(res.body.totals).toEqual({ users: 2, products: 1, ideas: 2, votes: 2, comments: 1 });
    expect(res.body.ideaStatusCounts).toEqual([{ status: "New", _count: 2 }]);
    expect(res.body.voteStats).toEqual(
      expect.arrayContaining([
        { type: "UP", _count: 1 },
        { type: "DOWN", _count: 1 },
      ])
    );
    expect(res.body.topIdeas[0]).toMatchObject({ id: idea.id, _count: { votes: 2, comments: 1 } });
    expect(res.body.topProducts[0]).toMatchObject({ id: product.id, _count: { ideas: 2 } });
    expect(res.body.recentUsers).toHaveLength(2);
  });

  it("never includes password hashes in the response", async () => {
    const admin = await registerUser({ role: "ADMIN" });
    const owner = await registerUser();
    const product = await createProduct(owner.auth);
    await createIdea(product.id, { auth: owner.auth });

    const res = await dashboard(admin.auth).expect(200);

    expect(JSON.stringify(res.body)).not.toMatch(/"password"/);
    expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/);
  });
});
