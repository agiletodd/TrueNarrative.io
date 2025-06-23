
import { describe, it, expect } from "vitest";
import { formatUser } from "../utils/formatUser.js";

describe("formatUser", () => {
  it("should return a sanitized user object", () => {
    const dbUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedpassword",
      firstname: "Jane",
      lastname: "Doe",
      avatarUrl: "http://example.com/avatar.jpg",
      bio: "Hi!",
      role: "ADMIN",
      createdAt: "2023-01-01",
    };

    const formatted = formatUser(dbUser);

    expect(formatted).toEqual({
      id: 1,
      email: "test@example.com",
      firstname: "Jane",
      lastname: "Doe",
      avatarUrl: "http://example.com/avatar.jpg",
      bio: "Hi!",
      role: "ADMIN",
    });

    expect(formatted).not.toHaveProperty("password");
    expect(formatted).not.toHaveProperty("createdAt");
  });
});
