"use client";
import useSWR, { Fetcher } from "swr";
import { useEffect, useState } from "react";

type Trade = {
  _id: string;
  symbol: string;
  side: string;
  qty: number;
  price: number;
  explorer?: string;
};

type TradesResponse = { trades: Trade[] };

// ----- Typed tuple key & fetcher -----
type TradesKey = readonly [url: string, token: string];

const tradesFetcher: Fetcher<TradesResponse, TradesKey> = async ([url, token]) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(
    (r) => r.json() as Promise<TradesResponse>
  );

export default function DashboardPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  // Make the key a *const* tuple so TS knows it's [string, string], not unknown[]
  const key = token ? (["/api/trades/list", token] as const) : null;

  // Pass the typed fetcher
  const { data, error } = useSWR<TradesResponse>(key, tradesFetcher);

  if (!token) return <div className="p-6">Please login first.</div>;
  if (error) return <div className="p-6 text-red-400">Error loading trades</div>;
  if (!data) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <main className="min-h-screen p-6">
      <h1 className="mb-4 text-2xl">Dashboard</h1>
      <h2 className="mb-2 text-lg">Ongoing Trades</h2>
      <ul className="space-y-2">
        {data.trades.map((t: Trade) => (
          <li key={t._id} className="rounded border border-green-700 p-2">
            {t.symbol} — {t.side} {t.qty} @ {t.price}
            {t.explorer && (
              <a
                href={t.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline"
              >
                View Tx
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
