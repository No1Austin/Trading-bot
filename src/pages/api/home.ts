import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fng = await fetch(process.env.FNG_API!).then(r => r.json());
    const idx = Number(fng?.data?.[0]?.value ?? 50);

    const url = `${process.env.COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&price_change_percentage=24h`;
    const mkts = await fetch(url).then(r => r.json());

    mkts.sort((a: any, b: any) =>
      (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
    );

    const topGainers = mkts.slice(0, 20);
    const topLosers = mkts.slice(-20).reverse();

    res.json({ greedFear: idx, topGainers, topLosers });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
