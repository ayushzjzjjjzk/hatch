import Image from "next/image";
import { initials } from "@/lib/utils";
import type { StartupCardData } from "@/lib/types";
import { BatchBadge, CategoryBadges } from "./StartupMeta";
import { StartupActions } from "./StartupActions";
import { VisitWebsiteButton } from "./VisitWebsiteButton";
import { SocialLinks } from "./SocialLinks";
import { FounderCard } from "./FounderCard";
import { MapPin, Calendar, Users } from "lucide-react";

export function StartupDetailContent({
  startup,
  isAuthenticated,
  liked,
  saved,
  compact = false
}: {
  startup: StartupCardData;
  isAuthenticated: boolean;
  liked: boolean;
  saved: boolean;
  compact?: boolean;
}) {
  const categories = startup.categories.map((c) => c.category);
  const gallery = startup.coverImageUrl
    ? [{ id: "cover", url: startup.coverImageUrl, alt: startup.name }, ...startup.images]
    : startup.images;

  return (
    <div>
      {/* header */}
      <div className="mb-6 flex items-start gap-4">
        {startup.logoUrl ? (
          <Image
            src={startup.logoUrl}
            alt={`${startup.name} logo`}
            width={compact ? 52 : 64}
            height={compact ? 52 : 64}
            className="shrink-0 rounded-2xl border border-border-strong object-cover"
          />
        ) : (
          <div
            className="flex shrink-0 items-center justify-center rounded-2xl bg-violet-gradient font-display font-bold text-white"
            style={{ width: compact ? 52 : 64, height: compact ? 52 : 64 }}
          >
            {initials(startup.name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="mb-1.5">
            <BatchBadge batch={startup.ycBatch} />
          </div>
          <h1 className={compact ? "font-display text-xl font-bold text-text" : "font-display text-3xl font-extrabold tracking-tight text-text"}>
            {startup.name}
          </h1>
        </div>
      </div>

      <p className={compact ? "mb-4 text-sm text-text-dim" : "mb-4 text-base text-text-dim"}>{startup.shortDescription}</p>

      <div className="mb-5">
        <CategoryBadges categories={categories} />
      </div>

      <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-faint">
        {startup.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {startup.location}
          </span>
        )}
        {startup.foundedYear && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Founded {startup.foundedYear}
          </span>
        )}
        {startup.employeeRange && (
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {startup.employeeRange} employees
          </span>
        )}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2.5">
        <VisitWebsiteButton startupId={startup.id} websiteUrl={startup.websiteUrl} />
        <StartupActions
          startupId={startup.id}
          startupName={startup.name}
          shortDescription={startup.shortDescription}
          isAuthenticated={isAuthenticated}
          initialLiked={liked}
          initialSaved={saved}
          initialLikeCount={startup._count.likes}
          variant="buttons"
        />
      </div>

      <Section title="About">
        <p className="whitespace-pre-line text-sm leading-relaxed text-text-dim">{startup.description}</p>
      </Section>

      {startup.founders.length > 0 && (
        <Section title="Founders">
          <div className={compact ? "flex flex-col gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
            {startup.founders.map((f) => (
              <FounderCard key={f.id} founder={f} />
            ))}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section title="Product">
          <div className={compact ? "flex flex-col gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
            {gallery.map((img) => (
              <div key={img.id} className="relative aspect-video overflow-hidden rounded-xl border border-border-strong">
                <Image src={img.url} alt={img.alt ?? startup.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Social Links">
        <SocialLinks
          data={{
            websiteUrl: startup.websiteUrl,
            linkedinUrl: startup.linkedinUrl,
            xUrl: startup.xUrl,
            githubUrl: startup.githubUrl,
            youtubeUrl: startup.youtubeUrl
          }}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-faint">{title}</p>
      {children}
    </div>
  );
}
