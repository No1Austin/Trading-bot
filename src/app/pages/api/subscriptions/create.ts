import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { plan, txnHash, uid } = req.body; // plan: 'monthly' | 'yearly'

  if (!plan || !txnHash || !uid) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const D = await db();
  await D.collection("subs").insertOne({
    uid,
    plan,
    txnHash,
    address: process.env.USDT_TRC20_ADDRESS,
    status: "pending",
    createdAt: new Date(),
  });

  res.json({ ok: true, note: "Pending manual verification" });
}
