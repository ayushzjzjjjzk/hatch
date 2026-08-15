import { Globe, Github, Youtube } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export interface SocialLinksData {
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  githubUrl?: string | null;
  youtubeUrl?: string | null;
}

const LINK_DEFS: {
  key: keyof SocialLinksData;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "websiteUrl", label: "Website", Icon: Globe },
  { key: "linkedinUrl", label: "LinkedIn", Icon: LinkedInIcon },
  { key: "xUrl", label: "X", Icon: XIcon },
  { key: "githubUrl", label: "GitHub", Icon: Github },
  { key: "youtubeUrl", label: "YouTube", Icon: Youtube }
];

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56z" />
    </svg>
  );
}

export function SocialLinks({ data, size = "md" }: { data: SocialLinksData; size?: "sm" | "md" }) {
  const links = LINK_DEFS.filter((d) => data[d.key]);
  if (links.length === 0) return null;

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-2">
      {links.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={data[key]!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cnDim(dim)}
        >
          <Icon className={iconDim} />
        </a>
      ))}
    </div>
  );
}

function cnDim(dim: string) {
  return `focus-ring flex ${dim} items-center justify-center rounded-full border border-border-strong bg-white/[0.04] text-text-dim transition-colors hover:border-violet/50 hover:text-violet-light`;
}
