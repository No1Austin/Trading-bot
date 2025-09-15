"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // icon library already in shadcn stack

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-green-900/50 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-lg sm:text-2xl font-semibold tracking-tight text-green-400 hover:text-green-300 transition"
        >
          AI Powered Trading Bot
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-green-300 font-medium">
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

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded p-2 text-green-300 hover:text-green-100 focus:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden border-t border-green-900/50 bg-black/90">
          <div className="flex flex-col px-6 py-4 gap-4 text-green-300 font-medium">
            <Link
              href="/about"
              className="hover:text-green-200 transition"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-green-200 transition"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-green-700/60 bg-green-900/20 px-4 py-2 text-green-200 hover:bg-green-800/40 transition"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
