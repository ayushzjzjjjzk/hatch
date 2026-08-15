"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VisitWebsiteButton({
  startupId,
  websiteUrl,
  className,
  fullWidth
}: {
  startupId: string;
  websiteUrl: string;
  className?: string;
  fullWidth?: boolean;
}) {
  function handleClick() {
    // open synchronously in the click handler so popup blockers don't interfere,
    // then fire the tracking call without blocking navigation
    window.open(websiteUrl, "_blank", "noopener,noreferrer");
    fetch(`/api/startups/${startupId}/website-click`, { method: "POST" }).catch(() => {});
  }

  return (
    <Button
      variant="gradient"
      size="lg"
      onClick={handleClick}
      className={cn(fullWidth && "w-full", className)}
      aria-label={`Visit website (opens in a new tab)`}
    >
      Visit Website
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
}
