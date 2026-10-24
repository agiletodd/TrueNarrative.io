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

const vote = (ideaId, body, auth) => {
  const req = api().post(`/api/votes/${ideaId}`);
  return (auth ? req.set("Authorization", auth) : req).send(body);
};

describe("guest voting", () => {
  it("records an upvote and returns the new totals", async () => {
    const idea = await anIdea();

    const res = await vote(idea.id, { voteType: "UP", guestId: "guest-a" }).expect(200);

    expect(res.body).toMatchObject({ id: idea.id, upvotes: 1, downvotes: 0 });
  });

  it("accepts the vote type in any case", async () => {
    const idea = await anIdea();

    const res = await vote(idea.id, { voteType: "down", guestId: "guest-a" }).expect(200);

    expect(res.body).toMatchObject({ upvotes: 0, downvotes: 1 });
  });

  it("rejects a repeated vote in the same direction with 409", async () => {
    const idea = await anIdea();
    await vote(idea.id, { voteType: "UP", guestId: "guest-a" }).expect(200);

    const res = await vote(idea.id, { voteType: "UP", guestId: "guest-a" }).expect(409);

    expect(res.body.reason).toBe("duplicate_vote");
    expect(await prisma.ideaVote.count()).toBe(1);
  });

  it("switches direction instead of adding a second vote", async () => {
    const idea = await anIdea();
    await vote(idea.id, { voteType: "UP", guestId: "guest-a" }).expect(200);

    const res = await vote(idea.id, { voteType: "DOWN", guestId: "guest-a" }).expect(200);

    expect(res.body).toMatchObject({ upvotes: 0, downvotes: 1 });
    expect(await prisma.ideaVote.count()).toBe(1);
  });

  it("counts different guests separately", async () => {
    const idea = await anIdea();
    await vote(idea.id, { voteType: "UP", guestId: "guest-a" }).expect(200);

    const res = await vote(idea.id, { voteType: "UP", guestId: "guest-b" }).expect(200);

    expect(res.body.upvotes).toBe(2);
  });

  it("requires a guest id when not signed in", async () => {
    const idea = await anIdea();

    await vote(idea.id, { voteType: "UP" }).expect(400);
    expect(await prisma.ideaVote.count()).toBe(0);
  });

  it("treats an invalid token as a guest rather than rejecting the vote", async () => {
    const idea = await anIdea();

    await vote(idea.id, { voteType: "UP", guestId: "guest-a" }, "Bearer not-a-jwt").expect(200);

    const stored = await prisma.ideaVote.findFirst();
    expect(stored).toMatchObject({ guestId: "guest-a", userId: null });
  });
});

describe("authenticated voting", () => {
  it("records the vote against the user, not a guest id", async () => {
    const idea = await anIdea();
    const voter = await registerUser();

    await vote(idea.id, { voteType: "UP", guestId: "ignored" }, voter.auth).expect(200);

    const stored = await prisma.ideaVote.findFirst();
    expect(stored).toMatchObject({ userId: voter.user.id, guestId: null, type: "UP" });
  });

  it("allows one vote per user per idea", async () => {
    const idea = await anIdea();
    const voter = await registerUser();
    await vote(idea.id, { voteType: "UP" }, voter.auth).expect(200);

    await vote(idea.id, { voteType: "UP" }, voter.auth).expect(409);
    const switched = await vote(idea.id, { voteType: "DOWN" }, voter.auth).expect(200);

    expect(switched.body).toMatchObject({ upvotes: 0, downvotes: 1 });
    expect(await prisma.ideaVote.count()).toBe(1);
  });
});

describe("invalid vote requests", () => {
  it.each([
    ["a missing vote type", {}],
    ["an unknown vote type", { voteType: "SIDEWAYS" }],
  ])("rejects %s", async (_label, body) => {
    const idea = await anIdea();

    await vote(idea.id, { guestId: "guest-a", ...body }).expect(400);
  });

  it("rejects a non-numeric idea id", async () => {
    await vote("abc", { voteType: "UP", guestId: "guest-a" }).expect(400);
  });

  it.todo("rejects a vote for an idea that does not exist with 404 (currently 500; Phase 4, S7)");
});

describe("GET /api/votes/:ideaId", () => {
  it("reports a guest's own vote and the totals", async () => {
    const idea = await anIdea();
    await vote(idea.id, { voteType: "DOWN", guestId: "guest-a" }).expect(200);
    await vote(idea.id, { voteType: "UP", guestId: "guest-b" }).expect(200);

    const res = await api().get(`/api/votes/${idea.id}`).query({ guestId: "guest-a" }).expect(200);

    expect(res.body).toEqual({ voted: true, type: "DOWN", thumbsUp: 1, thumbsDown: 1 });
  });

  it("reports a signed-in user's vote", async () => {
    const idea = await anIdea();
    const voter = await registerUser();
    await vote(idea.id, { voteType: "UP" }, voter.auth).expect(200);

    const res = await api().get(`/api/votes/${idea.id}`).set("Authorization", voter.auth).expect(200);

    expect(res.body).toMatchObject({ voted: true, type: "UP" });
  });

  it("reports no vote for a caller who has not voted", async () => {
    const idea = await anIdea();

    const res = await api().get(`/api/votes/${idea.id}`).expect(200);

    expect(res.body).toEqual({ voted: false, type: null, thumbsUp: 0, thumbsDown: 0 });
  });
});
