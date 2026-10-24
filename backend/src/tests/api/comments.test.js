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

async function anIdea() {
  const owner = await registerUser();
  const product = await createProduct(owner.auth);
  return createIdea(product.id);
}

const postComment = (body, auth) => {
  const req = api().post("/api/comments");
  return (auth ? req.set("Authorization", auth) : req).send(body);
};

describe("creating comments", () => {
  it("accepts a guest comment with a display name and trims the content", async () => {
    const idea = await anIdea();

    const res = await postComment({
      ideaId: idea.id,
      content: "  Great idea  ",
      guestName: "  Robin  ",
      guestId: "guest-a",
    }).expect(201);

    expect(res.body).toMatchObject({
      ideaId: idea.id,
      content: "Great idea",
      guestName: "Robin",
      userId: null,
    });
  });

  it("attributes a signed-in comment to the user and ignores guest fields", async () => {
    const idea = await anIdea();
    const author = await registerUser({ firstname: "Kim", lastname: "Lee" });

    const res = await postComment(
      { ideaId: idea.id, content: "Signed in", guestName: "Impostor", guestId: "guest-a" },
      author.auth
    ).expect(201);

    expect(res.body).toMatchObject({ userId: author.user.id, guestName: null, guestId: null });
    expect(res.body.user).toEqual({ id: author.user.id, firstname: "Kim", lastname: "Lee" });
  });

  it.each([
    ["no content", { guestName: "Robin", guestId: "g" }],
    ["blank content", { content: "   ", guestName: "Robin", guestId: "g" }],
    ["a guest without a name", { content: "Hi", guestId: "g" }],
    ["a guest with a blank name", { content: "Hi", guestName: "  ", guestId: "g" }],
    ["a guest without a guest id", { content: "Hi", guestName: "Robin" }],
  ])("rejects %s", async (_label, body) => {
    const idea = await anIdea();

    await postComment({ ideaId: idea.id, ...body }).expect(400);
    expect(await prisma.ideaComment.count()).toBe(0);
  });

  it("rejects a comment without an idea id", async () => {
    await postComment({ content: "Hi", guestName: "Robin", guestId: "g" }).expect(400);
  });
});

describe("retrieving comments", () => {
  it("lists an idea's comments newest first with author display fields only", async () => {
    const idea = await anIdea();
    const author = await registerUser({ firstname: "Kim", lastname: "Lee" });
    await prisma.ideaComment.create({
      data: { ideaId: idea.id, content: "Older", guestId: "g", guestName: "Guest", createdAt: new Date("2025-01-01") },
    });
    await prisma.ideaComment.create({
      data: { ideaId: idea.id, content: "Newer", userId: author.user.id, createdAt: new Date("2025-02-01") },
    });

    const res = await api().get(`/api/ideas/${idea.id}/comments`).expect(200);

    expect(res.body.map((c) => c.content)).toEqual(["Newer", "Older"]);
    expect(res.body[0].user).toEqual({ id: author.user.id, firstname: "Kim", lastname: "Lee" });
  });

  it("rejects a non-numeric idea id", async () => {
    await api().get("/api/ideas/abc/comments").expect(400);
  });
});

describe("editing and deleting comments", () => {
  async function signedInComment() {
    const idea = await anIdea();
    const author = await registerUser();
    const res = await postComment({ ideaId: idea.id, content: "Original" }, author.auth).expect(201);
    return { author, comment: res.body };
  }

  it("lets the author edit their comment", async () => {
    const { author, comment } = await signedInComment();

    const res = await api()
      .put(`/api/comments/${comment.id}`)
      .set("Authorization", author.auth)
      .send({ content: "Edited" })
      .expect(200);

    expect(res.body.content).toBe("Edited");
  });

  it("forbids other users and guests from editing", async () => {
    const { comment } = await signedInComment();
    const other = await registerUser();

    await api().put(`/api/comments/${comment.id}`).set("Authorization", other.auth).send({ content: "x" }).expect(403);
    await api().put(`/api/comments/${comment.id}`).send({ content: "x" }).expect(403);

    const stored = await prisma.ideaComment.findUnique({ where: { id: comment.id } });
    expect(stored.content).toBe("Original");
  });

  it("lets the author delete their comment", async () => {
    const { author, comment } = await signedInComment();

    await api().delete(`/api/comments/${comment.id}`).set("Authorization", author.auth).expect(204);

    expect(await prisma.ideaComment.count()).toBe(0);
  });

  it("forbids other users and guests from deleting", async () => {
    const { comment } = await signedInComment();
    const other = await registerUser();

    await api().delete(`/api/comments/${comment.id}`).set("Authorization", other.auth).expect(403);
    await api().delete(`/api/comments/${comment.id}`).expect(403);

    expect(await prisma.ideaComment.count()).toBe(1);
  });

  it("does not let a guest delete another guest's comment", async () => {
    const idea = await anIdea();
    const res = await postComment({ ideaId: idea.id, content: "Guest says", guestName: "A", guestId: "guest-a" }).expect(201);

    await api().delete(`/api/comments/${res.body.id}`).expect(403);
    expect(await prisma.ideaComment.count()).toBe(1);
  });

  it("returns 404 for a comment that does not exist", async () => {
    const author = await registerUser();

    await api().delete("/api/comments/999999").set("Authorization", author.auth).expect(404);
  });
});
