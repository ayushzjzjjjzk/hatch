import Image from "next/image";
import Link from "next/link";
import type { StartupCardData } from "@/lib/types";
import { initials, formatCount } from "@/lib/utils";
import { BatchBadge } from "./StartupMeta";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

export function CompactStartupCard({ startup }: { startup: StartupCardData }) {
  const categories = startup.categories.slice(0, 2).map((c) => c.category);

  return (
    <Link
      href={`/startup/${startup.slug}`}
      className="focus-ring group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-surface-2">
        {startup.coverImageUrl ? (
          <Image
            src={startup.coverImageUrl}
            alt={`${startup.name} product screenshot`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-violet-gradient" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <BatchBadge batch={startup.ycBatch} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2.5">
          {startup.logoUrl ? (
            <Image src={startup.logoUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-lg border border-border-strong object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-gradient text-xs font-bold text-white">
              {initials(startup.name)}
            </div>
          )}
          <p className="truncate font-display text-[15px] font-bold text-text">{startup.name}</p>
        </div>

        <p className="line-clamp-2 text-sm text-text-dim">{startup.shortDescription}</p>

        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Badge key={c.id} size="sm">
                {c.name}
              </Badge>
            ))}
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-text-faint">
            <Heart className="h-3.5 w-3.5" />
            {formatCount(startup._count.likes)}
          </span>
        </div>
      </div>
    </Link>
  );
}
