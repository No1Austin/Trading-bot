import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { db } from "@/lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  const D = await db();
  const s = await D.collection("subs").findOne({ uid, status: "approved" });
  if (!s) return res.status(403).json({ error: "Subscription not approved yet" });

  const apiKey = crypto.randomBytes(24).toString("hex");
  await D.collection("apiKeys").updateOne({ uid }, { $set: { apiKey, createdAt: new Date() } }, { upsert: true });

  res.json({ apiKey });
}
