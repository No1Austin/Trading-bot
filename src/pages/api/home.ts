import type { NextApiRequest, NextApiResponse } from "next";

type Market = {
  id: string;
  symbol: string;
  name: string;
  price_change_percentage_24h?: number;
};

type Success = { greedFear: number; topGainers: Market[]; topLosers: Market[] };
type Failure = { error: string };

const FNG_DEFAULT = "https://api.alternative.me/fng/?limit=1";
const COINGECKO_BASE_DEFAULT = "https://api.coingecko.com/api/v3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Success | Failure>
) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const FNG_API = process.env.FNG_API || FNG_DEFAULT;
    const CG_BASE = process.env.COINGECKO_BASE || COINGECKO_BASE_DEFAULT;

    // --- Fear & Greed (tolerate failure) ---
    let greedFear = 50;
    try {
      const fngRes = await fetch(FNG_API, { cache: "no-store" });
      const fngRaw: unknown = await fngRes.json();
      if (
        fngRaw &&
        typeof fngRaw === "object" &&
        "data" in fngRaw &&
        Array.isArray((fngRaw as { data?: unknown[] }).data)
      ) {
        const v = (fngRaw as { data: Array<{ value?: unknown }> }).data[0]?.value;
        const n = Number(v);
        if (!Number.isNaN(n)) greedFear = n;
      }
    } catch {
      // keep default 50
    }

    // --- Markets (tolerate failure) ---
    let markets: Market[] = [];
    try {
      const url = `${CG_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&price_change_percentage=24h`;
      const mktsRes = await fetch(url, {
        cache: "no-store",
        headers: { "User-Agent": "ai-trader/1.0" }, // helps some APIs
      });
      const mktsRaw: unknown = await mktsRes.json();

      if (Array.isArray(mktsRaw)) {
        markets = mktsRaw
          .map((item: unknown): Market | null => {
            if (!item || typeof item !== "object") return null;
            const obj = item as Record<string, unknown>;
            const id = typeof obj.id === "string" ? obj.id : "";
            const symbol = typeof obj.symbol === "string" ? obj.symbol : "";
            const name = typeof obj.name === "string" ? obj.name : "";
            const p24 =
              typeof obj.price_change_percentage_24h === "number"
                ? obj.price_change_percentage_24h
                : undefined;
            if (!id || !symbol || !name) return null;
            return { id, symbol, name, price_change_percentage_24h: p24 };
          })
          .filter((x): x is Market => x !== null);
      }
    } catch {
      // leave markets as []
    }

    // sort + slice (works even if [])
    markets.sort(
      (a, b) =>
        (b.price_change_percentage_24h ?? 0) -
        (a.price_change_percentage_24h ?? 0)
    );
    const topGainers = markets.slice(0, 20);
    const topLosers = markets.slice(-20).reverse();

    res.status(200).json({ greedFear, topGainers, topLosers });
  } catch (e) {
    // final safety net: return empty payload instead of 500
    res.status(200).json({ greedFear: 50, topGainers: [], topLosers: [] });
  }
}
