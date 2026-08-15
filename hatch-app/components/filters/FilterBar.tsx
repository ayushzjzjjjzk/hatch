"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/form-fields";
import { EMPLOYEE_RANGES } from "@/lib/utils";
import { X } from "lucide-react";

interface FilterBarProps {
  categories: { id: string; name: string; slug: string }[];
  batches: string[];
  locations: string[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "recent", label: "Recently Added" }
];

export function FilterBar({ categories, batches, locations }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const hasFilters = ["category", "batch", "location", "employeeRange", "search"].some((k) => searchParams.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
        className="w-auto min-w-[9rem]"
        aria-label="Category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        value={searchParams.get("batch") ?? ""}
        onChange={(e) => setParam("batch", e.target.value)}
        className="w-auto min-w-[7rem]"
        aria-label="YC Batch"
      >
        <option value="">All batches</option>
        {batches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </Select>

      <Select
        value={searchParams.get("location") ?? ""}
        onChange={(e) => setParam("location", e.target.value)}
        className="w-auto min-w-[9rem]"
        aria-label="Location"
      >
        <option value="">All locations</option>
        {locations.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </Select>

      <Select
        value={searchParams.get("employeeRange") ?? ""}
        onChange={(e) => setParam("employeeRange", e.target.value)}
        className="w-auto min-w-[8rem]"
        aria-label="Employee size"
      >
        <option value="">Any size</option>
        {EMPLOYEE_RANGES.map((r) => (
          <option key={r} value={r}>
            {r} employees
          </option>
        ))}
      </Select>

      <Select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => setParam("sort", e.target.value)}
        className="w-auto min-w-[9rem]"
        aria-label="Sort"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="focus-ring flex items-center gap-1 rounded-full border border-border-strong px-3 py-2 text-xs font-medium text-text-dim hover:text-text"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
