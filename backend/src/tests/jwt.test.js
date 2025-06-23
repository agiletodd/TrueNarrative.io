import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/jwt";

const SECRET = "supersecret"; // must match the value used in the util

describe("generateToken", () => {
  it("should return a valid JWT", () => {
    const payload = { userId: 123, role: "USER" };
    const token = generateToken(payload);

    const decoded = jwt.verify(token, SECRET); // using the same secret
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });
});
