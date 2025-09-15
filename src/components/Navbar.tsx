"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-green-900/50 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight text-green-400 hover:text-green-300 transition"
        >
          AI Powered Trading Bot
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8 text-green-300 font-medium">
          <Link href="/about" className="hover:text-green-200 transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-green-200 transition">
            Contact
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-green-700/60 bg-green-900/20 px-4 py-2 text-green-200 hover:bg-green-800/40 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
