// src/pages/api/auth/login.ts  (see #2 about the path)
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../../lib/mongo";

type JwtPayload = { uid: string; email: string }; // what you put in the token
type Success = { ok: true; token: string };
type Failure = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Success | Failure>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Missing credentials" });
    return;
  }

  const D = await db();
  const users = D.collection("users");
  const user = await users.findOne<{ _id: string; email: string; passHash: string }>({ email });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfigured (JWT_SECRET missing)" });
    return;
  }

  const token = jwt.sign(
    { uid: user._id, email: user.email } as JwtPayload,
    secret,
    { expiresIn: "7d" }
  );

  res.status(200).json({ ok: true, token });
}
