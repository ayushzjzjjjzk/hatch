import type { StartupCardData } from "@/lib/types";
import { StartupDetailContent } from "./StartupDetailContent";

export function DesktopDetailPanel({
  startup,
  isAuthenticated,
  liked,
  saved
}: {
  startup: StartupCardData;
  isAuthenticated: boolean;
  liked: boolean;
  saved: boolean;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[380px] shrink-0 overflow-y-auto border-l border-border px-6 py-8 xl:block">
      <StartupDetailContent startup={startup} isAuthenticated={isAuthenticated} liked={liked} saved={saved} compact />
    </aside>
  );
}
