"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Rocket, PlusCircle, Tag, BarChart3, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/startups", label: "Startups", icon: Rocket, exact: true },
  { href: "/admin/startups/new", label: "Add Startup", icon: PlusCircle, exact: true },
  { href: "/admin/categories", label: "Categories", icon: Tag, exact: true },
  { href: "/admin#analytics", label: "Analytics", icon: BarChart3, exact: false }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col justify-between border-r border-border px-4 py-6">
      <div>
        <Link href="/admin" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-gradient">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-text">Hatch Admin</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href.split("#")[0]);
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
      </div>

      <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-dim hover:bg-white/[0.05] hover:text-text">
        <ArrowLeft className="h-[18px] w-[18px]" />
        Back to Hatch
      </Link>
    </aside>
  );
}
