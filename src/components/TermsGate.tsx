"use client";
import { useEffect, useState } from "react";

export default function TermsGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(localStorage.getItem("termsAccepted") === "yes"); }, []);
  if (ok) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 text-white grid place-items-center p-6">
      <div className="max-w-xl bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Terms & Conditions</h2>
        <p>We are not investment professionals and this is not financial advice. Trading crypto is risky. Only trade money you can afford to lose.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" onChange={e => localStorage.setItem("termsAccepted", e.target.checked ? "yes" : "no")} />
          I understand and agree
        </label>
        <button
          onClick={() => setOk(localStorage.getItem("termsAccepted") === "yes")}
          className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-300/30"
        >
          I Accept
        </button>
      </div>
    </div>
  );
}
