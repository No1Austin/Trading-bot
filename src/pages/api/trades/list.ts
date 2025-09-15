import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const D = await db();
  const rows = await D.collection("trades")
    .find({ status: { $in: ["open", "closed"] } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const base = process.env.BANTU_EXPLORER_BASE || "";
  const data = rows.map((r) => ({ ...r, explorer: r.bantuTxHash ? base + r.bantuTxHash : null }));

  res.json({ trades: data });
}
