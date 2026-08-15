import { Badge } from "@/components/ui/badge";

export function CategoryBadges({
  categories,
  size = "md"
}: {
  categories: { id: string; name: string }[];
  size?: "sm" | "md";
}) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((c) => (
        <Badge key={c.id} size={size}>
          {c.name}
        </Badge>
      ))}
    </div>
  );
}

export function BatchBadge({ batch }: { batch: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-violet/30 bg-violet/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-violet-light">
      <span className="text-text-faint">YC</span>
      {batch}
    </div>
  );
}

export function MetaLine({ batch, location }: { batch: string; location?: string | null }) {
  return (
    <p className="font-mono text-xs text-text-faint">
      YC {batch}
      {location ? ` · ${location}` : ""}
    </p>
  );
}
