// src/pages/api/home.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Market = {
  id: string;
  symbol: string;
  name: string;
  price_change_percentage_24h?: number;
};

type Success = {
  greedFear: number;
  topGainers: Market[];
  topLosers: Market[];
};

type Failure = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Success | Failure>
) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // --- Fear & Greed Index ---
    const fngRes = await fetch(process.env.FNG_API as string);
    const fngRaw: unknown = await fngRes.json();

    let idx = 50;
    if (
      fngRaw &&
      typeof fngRaw === "object" &&
      "data" in fngRaw &&
      Array.isArray((fngRaw as { data?: unknown[] }).data)
    ) {
      const val = (fngRaw as { data: Array<{ value?: unknown }> }).data[0]?.value;
      const n = Number(val);
      if (!Number.isNaN(n)) idx = n;
    }

    // --- Markets (CoinGecko) ---
    const url = `${process.env.COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&price_change_percentage=24h`;
    const mktsRes = await fetch(url);
    const mktsRaw: unknown = await mktsRes.json();

    let mkts: Market[] = [];
    if (Array.isArray(mktsRaw)) {
      mkts = mktsRaw
        .map((item: unknown): Market | null => {
          if (!item || typeof item !== "object") return null;

          const id = (item as Record<string, unknown>).id;
          const symbol = (item as Record<string, unknown>).symbol;
          const name = (item as Record<string, unknown>).name;
          const p24 = (item as Record<string, unknown>).price_change_percentage_24h;

          const safeId = typeof id === "string" ? id : "";
          const safeSymbol = typeof symbol === "string" ? symbol : "";
          const safeName = typeof name === "string" ? name : "";
          const safeP24 = typeof p24 === "number" ? p24 : undefined;

          if (!safeId || !safeSymbol || !safeName) return null;

          return {
            id: safeId,
            symbol: safeSymbol,
            name: safeName,
            price_change_percentage_24h: safeP24,
          };
        })
        .filter((x): x is Market => x !== null);
    }

    // Sort by 24h percentage change (desc), then slice for top gainers/losers
    mkts.sort(
      (a, b) =>
        (b.price_change_percentage_24h ?? 0) -
        (a.price_change_percentage_24h ?? 0)
    );

    const topGainers = mkts.slice(0, 20);
    const topLosers = mkts.slice(-20).reverse();

    res.status(200).json({ greedFear: idx, topGainers, topLosers });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
