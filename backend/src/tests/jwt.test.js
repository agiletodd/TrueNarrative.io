import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../utils/jwt.js";

describe("jwt utilities", () => {
  it("signs tokens that verifyToken accepts", () => {
    const token = generateToken({ userId: 123, role: "USER" });

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(123);
    expect(decoded.role).toBe("USER");
  });

  it("signs with the configured secret, not a built-in default", () => {
    const token = generateToken({ userId: 1 });

    expect(() => jwt.verify(token, process.env.JWT_SECRET)).not.toThrow();
    expect(() => jwt.verify(token, "supersecret")).toThrow();
  });

  it("rejects a token signed with another secret", () => {
    const forged = jwt.sign({ userId: 1, role: "ADMIN" }, "attacker-secret");

    expect(() => verifyToken(forged)).toThrow();
  });
});
