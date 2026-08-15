import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

export function Header() {
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-bg/95 to-transparent px-5 pb-6 lg:hidden"
      style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }}
    >
      <div>
        <p className="font-display text-lg font-extrabold tracking-tight text-text">Hatch</p>
        <p className="text-xs text-text-dim">Discover YC startups</p>
      </div>
      <Link
        href="/explore"
        aria-label="Filters"
        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-white/[0.06] text-text-dim"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Link>
    </header>
  );
}
