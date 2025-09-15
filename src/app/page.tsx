"use client";

import useSWR from "swr";
import TermsGate from "../components/TermsGate";
import GreedFearGauge from "../components/GreedFearGauge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data, error } = useSWR("/api/home", fetcher);

  if (error) return <div className="p-6 text-red-400">Failed to load</div>;
  if (!data) return <div className="p-6 text-green-300/60">Loading…</div>;

  return (
    <TermsGate>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-4xl font-extrabold text-green-300">AI Powered Trading Bot</h1>

        {/* Fear & Greed */}
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-green-200">Fear & Greed Index</h2>
          <div className="flex items-center gap-8">
            <GreedFearGauge value={data.greedFear} />
            <p className="max-w-prose text-green-300/80">
              Sentiment snapshot from the last 24 hours. Use alongside top movers for quick context.
            </p>
          </div>
        </section>

        {/* Top movers */}
        <section className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-green-200">Top 20 Gainers</h3>
            <ul className="divide-y divide-green-900/40 overflow-hidden rounded-xl border border-green-900/50">
              {data.topGainers.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-2">
                  <span className="font-medium">{c.symbol.toUpperCase()}</span>
                  <span className="text-green-300">+{c.price_change_percentage_24h?.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-green-200">Top 20 Losers</h3>
            <ul className="divide-y divide-green-900/40 overflow-hidden rounded-xl border border-green-900/50">
              {data.topLosers.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-2">
                  <span className="font-medium">{c.symbol.toUpperCase()}</span>
                  <span className="text-red-300">{c.price_change_percentage_24h?.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </TermsGate>
  );
}
