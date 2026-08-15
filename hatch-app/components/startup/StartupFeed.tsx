"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { StartupCardData } from "@/lib/types";
import { StartupCard } from "./StartupCard";
import { DesktopDetailPanel } from "./DesktopDetailPanel";

function getOrCreateAnonId(): string {
  const key = "hatch_anon_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function StartupFeed({
  startups,
  isAuthenticated,
  likedIds,
  savedIds
}: {
  startups: StartupCardData[];
  isAuthenticated: boolean;
  likedIds: string[];
  savedIds: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const viewedRef = useRef<Set<string>>(new Set());
  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const recordView = useCallback(
    (startupId: string) => {
      if (viewedRef.current.has(startupId)) return;
      viewedRef.current.add(startupId);
      const body: { sessionId?: string } = {};
      if (!isAuthenticated) body.sessionId = getOrCreateAnonId();
      fetch(`/api/startups/${startupId}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).catch(() => {});
    },
    [isAuthenticated]
  );

  // a startup is "viewed" once it's >=60% visible for ~500ms - short scroll
  // flicks past a card never fire the timer, per the spec's view-tracking rule
  useEffect(() => {
    const root = feedRef.current;
    if (!root || startups.length === 0) return;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = cardRefs.current.findIndex((el) => el === entry.target);
          if (idx === -1) return;
          const startupId = startups[idx].id;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveIndex(idx);
            if (!timers.has(startupId)) {
              timers.set(
                startupId,
                setTimeout(() => recordView(startupId), 500)
              );
            }
          } else {
            const t = timers.get(startupId);
            if (t) {
              clearTimeout(t);
              timers.delete(startupId);
            }
          }
        });
      },
      { root, threshold: [0, 0.6] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [startups, recordView]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!feedRef.current) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        feedRef.current.scrollBy({ top: feedRef.current.clientHeight, behavior: "smooth" });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        feedRef.current.scrollBy({ top: -feedRef.current.clientHeight, behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (startups.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-xl font-bold text-text">No startups yet</p>
        <p className="max-w-xs text-sm text-text-dim">Once startups are published from the admin dashboard, they'll show up here.</p>
        <Link href="/explore" className="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-violet-gradient px-6 text-base font-medium text-white hover:brightness-110">
          Explore anyway
        </Link>
      </div>
    );
  }

  const active = startups[activeIndex];

  return (
    <div className="flex flex-1">
      <div
        ref={feedRef}
        className="no-scrollbar h-dvh flex-1 snap-y snap-mandatory overflow-y-scroll scroll-smooth lg:mx-auto lg:max-w-[620px]"
      >
        {startups.map((startup, i) => (
          <div
            key={startup.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="snap-start snap-always"
          >
            <StartupCard
              startup={startup}
              isActive={i === activeIndex}
              isAuthenticated={isAuthenticated}
              liked={likedSet.has(startup.id)}
              saved={savedSet.has(startup.id)}
            />
          </div>
        ))}
      </div>

      <DesktopDetailPanel
        startup={active}
        isAuthenticated={isAuthenticated}
        liked={likedSet.has(active.id)}
        saved={savedSet.has(active.id)}
      />
    </div>
  );
}
