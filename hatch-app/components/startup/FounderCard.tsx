import Image from "next/image";
import { initials } from "@/lib/utils";
import { SocialLinks } from "./SocialLinks";

export interface FounderData {
  id: string;
  name: string;
  role: string;
  photoUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  websiteUrl?: string | null;
  bio?: string | null;
}

export function FounderCard({ founder }: { founder: FounderData }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3.5">
        {founder.photoUrl ? (
          <Image
            src={founder.photoUrl}
            alt={founder.name}
            width={52}
            height={52}
            className="h-13 w-13 shrink-0 rounded-full border border-border-strong object-cover"
            style={{ width: 52, height: 52 }}
          />
        ) : (
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-violet-gradient font-display text-sm font-bold text-white" style={{ width: 52, height: 52 }}>
            {initials(founder.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-bold text-text">{founder.name}</p>
          <p className="mb-2.5 text-sm text-text-dim">{founder.role}</p>
          <SocialLinks
            data={{ linkedinUrl: founder.linkedinUrl, xUrl: founder.xUrl, websiteUrl: founder.websiteUrl }}
            size="sm"
          />
        </div>
      </div>
      {founder.bio && <p className="mt-3 text-sm leading-relaxed text-text-dim">{founder.bio}</p>}
    </div>
  );
}
