"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Compass, Bookmark, User, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "For You", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/saved", label: "Saved", icon: Bookmark }
];

export function DesktopSidebar({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col justify-between border-r border-border px-4 py-6 lg:flex">
      <div>
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-gradient">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-text">Hatch</span>
        </Link>

        <nav className="mb-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-violet/15 text-violet-light" : "text-text-dim hover:bg-white/[0.05] hover:text-text"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-text-faint">Categories</p>
        <nav className="flex flex-col gap-0.5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/explore?category=${c.slug}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                activeCategory === c.slug ? "text-violet-light" : "text-text-dim hover:text-text"
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>

      <nav className="flex flex-col gap-1 border-t border-border pt-4">
        <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-dim hover:bg-white/[0.05] hover:text-text">
          <User className="h-[18px] w-[18px]" />
          Profile
        </Link>
        <Link href="/profile#settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-dim hover:bg-white/[0.05] hover:text-text">
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
