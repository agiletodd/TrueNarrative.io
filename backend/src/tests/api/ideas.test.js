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

async function productWithOwner() {
  const owner = await registerUser();
  const product = await createProduct(owner.auth);
  return { owner, product };
}

describe("submitting ideas", () => {
  it("accepts an anonymous idea with status New", async () => {
    const { product } = await productWithOwner();

    const res = await api()
      .post(`/api/ideas/${product.id}`)
      .send({ title: "Dark mode", description: "Please add a dark theme" })
      .expect(201);

    expect(res.body).toMatchObject({
      title: "Dark mode",
      description: "Please add a dark theme",
      status: "New",
      productId: product.id,
      userId: null,
    });
  });

  it("associates an idea with the signed-in author", async () => {
    const { product } = await productWithOwner();
    const author = await registerUser();

    const idea = await createIdea(product.id, { auth: author.auth });

    expect(idea.userId).toBe(author.user.id);
  });

  it("ignores a status sent by the submitter", async () => {
    const { product } = await productWithOwner();

    const idea = await createIdea(product.id, { status: "Done" });

    expect(idea.status).toBe("New");
  });

  it.each([
    ["title", { description: "d" }],
    ["description", { title: "t" }],
  ])("requires a %s", async (_field, body) => {
    const { product } = await productWithOwner();

    const res = await api().post(`/api/ideas/${product.id}`).send(body).expect(400);
    expect(res.body.error).toEqual(expect.any(String));
    expect(await prisma.idea.count()).toBe(0);
  });

  it.todo("rejects an idea for a missing or non-numeric product with 400/404 (currently 500; Phase 4, S7)");
});

describe("retrieving ideas", () => {
  it("lists a product's ideas newest first, with vote and comment counts", async () => {
    const { product } = await productWithOwner();
    const older = await prisma.idea.create({
      data: { title: "Older", description: "d", productId: product.id, createdAt: new Date("2025-01-01") },
    });
    await prisma.idea.create({
      data: { title: "Newer", description: "d", productId: product.id, createdAt: new Date("2025-02-01") },
    });
    await prisma.ideaVote.createMany({
      data: [
        { ideaId: older.id, guestId: "g1", type: "UP" },
        { ideaId: older.id, guestId: "g2", type: "UP" },
        { ideaId: older.id, guestId: "g3", type: "DOWN" },
      ],
    });
    await prisma.ideaComment.create({
      data: { ideaId: older.id, content: "Agreed", guestId: "g1", guestName: "Guest" },
    });

    const res = await api().get(`/api/ideas/${product.id}`).expect(200);

    expect(res.body.map((i) => i.title)).toEqual(["Newer", "Older"]);
    expect(res.body[1]).toMatchObject({ upvotes: 2, downvotes: 1, commentCount: 1 });
    expect(res.body[0]).toMatchObject({ upvotes: 0, downvotes: 0, commentCount: 0 });
    expect(res.body[1]).not.toHaveProperty("votes");
  });

  it("only lists ideas that belong to the requested product", async () => {
    const { owner, product } = await productWithOwner();
    const otherProduct = await createProduct(owner.auth, { name: "Other" });
    await createIdea(product.id, { title: "For product A" });
    await createIdea(otherProduct.id, { title: "For product B" });

    const res = await api().get(`/api/ideas/${product.id}`).expect(200);

    expect(res.body.map((i) => i.title)).toEqual(["For product A"]);
  });

  it("returns one idea with its totals and comments", async () => {
    const { product } = await productWithOwner();
    const idea = await createIdea(product.id);
    await api().post(`/api/votes/${idea.id}`).send({ voteType: "UP", guestId: "g1" }).expect(200);
    await api()
      .post("/api/comments")
      .send({ ideaId: idea.id, content: "First!", guestName: "Sam", guestId: "g1" })
      .expect(201);

    const res = await api().get(`/api/idea/${idea.id}`).expect(200);

    expect(res.body).toMatchObject({ id: idea.id, upvotes: 1, downvotes: 0 });
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0]).toMatchObject({ content: "First!", guestName: "Sam" });
  });

  it("returns 404 for an idea that does not exist", async () => {
    await api().get("/api/idea/999999").expect(404);
  });

  it.each([
    ["the idea list", "/api/ideas/abc"],
    ["a single idea", "/api/idea/abc"],
  ])("rejects a non-numeric id for %s", async (_label, path) => {
    await api().get(path).expect(400);
  });
});
