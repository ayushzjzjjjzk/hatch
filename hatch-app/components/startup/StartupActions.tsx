"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { toast } from "sonner";
import { formatCount, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StartupActionsProps {
  startupId: string;
  startupName: string;
  shortDescription: string;
  isAuthenticated: boolean;
  initialLiked: boolean;
  initialSaved: boolean;
  initialLikeCount: number;
  variant?: "rail" | "buttons";
}

export function StartupActions({
  startupId,
  startupName,
  shortDescription,
  isAuthenticated,
  initialLiked,
  initialSaved,
  initialLikeCount,
  variant = "rail"
}: StartupActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pulse, setPulse] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  function requireAuth(): boolean {
    if (!isAuthenticated) {
      setPromptOpen(true);
      return false;
    }
    return true;
  }

  async function toggleLike() {
    if (!requireAuth()) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    if (next) {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }
    try {
      const res = await fetch(`/api/startups/${startupId}/like`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!next);
      setLikeCount((c) => c - (next ? 1 : -1));
      toast.error("Couldn't update like - try again");
    }
  }

  async function toggleSave() {
    if (!requireAuth()) return;
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch(`/api/startups/${startupId}/save`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(next ? "Saved" : "Removed from saved");
    } catch {
      setSaved(!next);
      toast.error("Couldn't update - try again");
    }
  }

  async function share() {
    const url = `${window.location.origin}/startup/${startupId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: startupName, text: shortDescription, url });
      } catch {
        /* user cancelled - not an error */
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  if (variant === "buttons") {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button variant={liked ? "gradient" : "outline"} size="md" onClick={toggleLike} aria-label="Like">
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {formatCount(likeCount)}
          </Button>
          <Button variant={saved ? "gradient" : "outline"} size="md" onClick={toggleSave} aria-label="Save">
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="icon" onClick={share} aria-label="Share">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <LoginPrompt open={promptOpen} onOpenChange={setPromptOpen} router={router} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-5">
        <button onClick={toggleLike} aria-label="Like" className="focus-ring flex flex-col items-center gap-1">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border transition-transform duration-300",
              liked ? "border-violet/50 bg-violet/20 text-violet-light" : "border-border-strong bg-black/30 text-text",
              pulse && "scale-125"
            )}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          </span>
          <span className="text-xs font-medium text-text-dim">{formatCount(likeCount)}</span>
        </button>

        <button onClick={toggleSave} aria-label="Save" className="focus-ring flex flex-col items-center gap-1">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
              saved ? "border-violet/50 bg-violet/20 text-violet-light" : "border-border-strong bg-black/30 text-text"
            )}
          >
            <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          </span>
        </button>

        <button onClick={share} aria-label="Share" className="focus-ring flex flex-col items-center gap-1">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-black/30 text-text">
            <Share2 className="h-5 w-5" />
          </span>
        </button>
      </div>
      <LoginPrompt open={promptOpen} onOpenChange={setPromptOpen} router={router} />
    </>
  );
}

function LoginPrompt({
  open,
  onOpenChange,
  router
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Sign in to continue</DialogTitle>
        <DialogDescription>Create a free account to like, save, and build your own list of startups.</DialogDescription>
        <div className="mt-5 flex gap-2">
          <Button variant="gradient" className="flex-1" onClick={() => router.push("/login")}>
            Log in
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push("/signup")}>
            Sign up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
