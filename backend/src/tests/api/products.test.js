import { describe, it, expect, beforeEach } from "vitest";
import {
  api,
  resetDatabase,
  registerUser,
  createProduct,
  createIdea,
  prisma,
} from "../support/helpers.js";

beforeEach(resetDatabase);

describe("creating products", () => {
  it("creates a product owned by the caller with a public guid", async () => {
    const { user, auth } = await registerUser();

    const res = await api()
      .post("/api/products")
      .set("Authorization", auth)
      .send({ name: "Roadmap", description: "Our public roadmap" })
      .expect(201);

    expect(res.body).toMatchObject({ name: "Roadmap", description: "Our public roadmap", ownerId: user.id });
    expect(res.body.guid).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("ignores an ownerId sent by the client", async () => {
    const owner = await registerUser();
    const other = await registerUser();

    const res = await api()
      .post("/api/products")
      .set("Authorization", owner.auth)
      .send({ name: "Mine", description: "d", ownerId: other.user.id })
      .expect(201);

    expect(res.body.ownerId).toBe(owner.user.id);
  });

  it.each([
    ["name", { description: "d" }],
    ["description", { name: "n" }],
  ])("requires a %s", async (_field, body) => {
    const { auth } = await registerUser();

    await api().post("/api/products").set("Authorization", auth).send(body).expect(400);
  });

  it("requires authentication", async () => {
    await api().post("/api/products").send({ name: "n", description: "d" }).expect(401);
  });
});

describe("retrieving products", () => {
  it("lists only the caller's own products", async () => {
    const alice = await registerUser();
    const bob = await registerUser();
    await createProduct(alice.auth, { name: "Alice's" });
    await createProduct(bob.auth, { name: "Bob's" });

    const res = await api().get("/api/products/mine").set("Authorization", alice.auth).expect(200);

    expect(res.body.map((p) => p.name)).toEqual(["Alice's"]);
  });

  it("serves a public board by guid without authentication", async () => {
    const { auth } = await registerUser();
    const product = await createProduct(auth);
    await createIdea(product.id, { title: "Public idea" });

    const res = await api().get(`/api/products/guid/${product.guid}`).expect(200);

    expect(res.body).toMatchObject({ id: product.id, name: product.name });
    expect(res.body.ideas.map((i) => i.title)).toEqual(["Public idea"]);
  });

  it("returns 404 for an unknown guid", async () => {
    await api().get("/api/products/guid/00000000-0000-0000-0000-000000000000").expect(404);
  });

  it("returns a product by numeric id to its owner", async () => {
    const { auth } = await registerUser();
    const product = await createProduct(auth);

    const res = await api().get(`/api/products/${product.id}`).set("Authorization", auth).expect(200);
    expect(res.body.id).toBe(product.id);
  });

  it("rejects a non-numeric product id", async () => {
    const { auth } = await registerUser();

    await api().get("/api/products/abc").set("Authorization", auth).expect(400);
  });

  it("returns 404 for a product id that does not exist", async () => {
    const { auth } = await registerUser();

    await api().get("/api/products/999999").set("Authorization", auth).expect(404);
  });

  it.todo("hides another owner's product from GET /api/products/:id (currently readable; Phase 4, S3)");
});

describe("updating products", () => {
  it("lets the owner update name and description", async () => {
    const { auth } = await registerUser();
    const product = await createProduct(auth);

    const res = await api()
      .put(`/api/products/${product.id}`)
      .set("Authorization", auth)
      .send({ name: "Renamed", description: "New description" })
      .expect(200);

    expect(res.body).toMatchObject({ id: product.id, name: "Renamed", description: "New description" });
    expect(res.body.guid).toBe(product.guid);
  });

  it("forbids another user from updating the product", async () => {
    const owner = await registerUser();
    const intruder = await registerUser();
    const product = await createProduct(owner.auth, { name: "Original" });

    await api()
      .put(`/api/products/${product.id}`)
      .set("Authorization", intruder.auth)
      .send({ name: "Hijacked", description: "x" })
      .expect(403);

    const stored = await prisma.product.findUnique({ where: { id: product.id } });
    expect(stored.name).toBe("Original");
  });

  it("requires authentication", async () => {
    const { auth } = await registerUser();
    const product = await createProduct(auth);

    await api().put(`/api/products/${product.id}`).send({ name: "x", description: "y" }).expect(401);
  });

  it("requires name and description", async () => {
    const { auth } = await registerUser();
    const product = await createProduct(auth);

    await api().put(`/api/products/${product.id}`).set("Authorization", auth).send({ name: "x" }).expect(400);
  });
});

describe("deleting products", () => {
  it("lets the owner delete the product, removing its ideas, votes, and comments", async () => {
    const { auth } = await registerUser();
    const product = await createProduct(auth);
    const idea = await createIdea(product.id);
    await api().post(`/api/votes/${idea.id}`).send({ voteType: "UP", guestId: "guest-1" }).expect(200);
    await api()
      .post("/api/comments")
      .send({ ideaId: idea.id, content: "Nice", guestName: "Guest", guestId: "guest-1" })
      .expect(201);

    await api().delete(`/api/products/${product.id}`).set("Authorization", auth).expect(204);

    expect(await prisma.product.count()).toBe(0);
    expect(await prisma.idea.count()).toBe(0);
    expect(await prisma.ideaVote.count()).toBe(0);
    expect(await prisma.ideaComment.count()).toBe(0);
  });

  it("forbids another user from deleting the product", async () => {
    const owner = await registerUser();
    const intruder = await registerUser();
    const product = await createProduct(owner.auth);

    await api().delete(`/api/products/${product.id}`).set("Authorization", intruder.auth).expect(403);

    expect(await prisma.product.count()).toBe(1);
  });

  it("requires authentication", async () => {
    const { auth } = await registerUser();
    const product = await createProduct(auth);

    await api().delete(`/api/products/${product.id}`).expect(401);
    expect(await prisma.product.count()).toBe(1);
  });
});
