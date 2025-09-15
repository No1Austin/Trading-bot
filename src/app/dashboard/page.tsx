"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

export default function DashboardPage() {
  const [token, setToken] = useState("");
  useEffect(() => { setToken(localStorage.getItem("token") || ""); }, []);
  const { data, error } = useSWR(token ? ["/api/trades/list", token] : null, fetcher);

  if (!token) return <div className="p-6">Please login first.</div>;
  if (error) return <div className="p-6 text-red-400">Error loading trades</div>;
  if (!data) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <h2 className="text-lg mb-2">Ongoing Trades</h2>
      <ul className="space-y-2">
        {data.trades.map((t: any) => (
          <li key={t._id} className="border border-green-700 p-2 rounded">
            {t.symbol} — {t.side} {t.qty} @ {t.price}
            {t.explorer && (
              <a href={t.explorer} target="_blank" rel="noopener noreferrer" className="ml-2 underline">
                View Tx
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
