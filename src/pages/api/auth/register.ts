import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const D = await db();
  const users = D.collection("users");
  const exists = await users.findOne({ email });
  if (exists) return res.status(409).json({ error: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const { insertedId } = await users.insertOne({
    name, email, passHash: hashed, createdAt: new Date(), sub: { status: "none" }
  });

  const token = jwt.sign({ uid: insertedId, email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token });
}
