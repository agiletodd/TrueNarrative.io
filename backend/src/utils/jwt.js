import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}
