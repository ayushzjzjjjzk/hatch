"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { StartupCardData } from "@/lib/types";
import { initials } from "@/lib/utils";
import { BatchBadge, CategoryBadges, MetaLine } from "./StartupMeta";
import { StartupActions } from "./StartupActions";
import { VisitWebsiteButton } from "./VisitWebsiteButton";
import Link from "next/link";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};
const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export function StartupCard({
  startup,
  isActive,
  isAuthenticated,
  liked,
  saved
}: {
  startup: StartupCardData;
  isActive: boolean;
  isAuthenticated: boolean;
  liked: boolean;
  saved: boolean;
}) {
  const categories = startup.categories.map((c) => c.category);

  return (
    <section className="relative flex h-dvh w-full items-center justify-center overflow-hidden border-b border-border px-5 sm:px-8">
      {/* ambient purple glow */}
      <div className="pointer-events-none absolute inset-0 bg-violet-glow" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-violet/20 blur-[100px]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="relative z-10 w-full max-w-md pr-14"
      >
        <motion.div variants={fadeIn} className="mb-4">
          <BatchBadge batch={startup.ycBatch} />
        </motion.div>

        <motion.div variants={fadeScale} className="mb-4">
          <Link href={`/startup/${startup.slug}`} className="focus-ring inline-block rounded-2xl">
            {startup.logoUrl ? (
              <Image
                src={startup.logoUrl}
                alt={`${startup.name} logo`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl border border-border-strong object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-gradient font-display text-xl font-bold text-white">
                {initials(startup.name)}
              </div>
            )}
          </Link>
        </motion.div>

        <motion.h1 variants={fadeUp} className="mb-2 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          <Link href={`/startup/${startup.slug}`} className="focus-ring rounded-lg hover:text-violet-light">
            {startup.name}
          </Link>
        </motion.h1>

        <motion.p variants={fadeUp} className="mb-4 text-[15px] leading-relaxed text-text-dim">
          {startup.shortDescription}
        </motion.p>

        <motion.div variants={fadeIn} className="mb-5">
          <CategoryBadges categories={categories} />
        </motion.div>

        <motion.div variants={fadeScale} className="mb-5">
          <Link href={`/startup/${startup.slug}`} className="focus-ring block overflow-hidden rounded-2xl">
            <ScreenshotPreview startup={startup} />
          </Link>
        </motion.div>

        <motion.div variants={fadeIn} className="mb-6">
          <MetaLine batch={startup.ycBatch} location={startup.location} />
        </motion.div>

        <motion.div variants={fadeIn}>
          <VisitWebsiteButton startupId={startup.id} websiteUrl={startup.websiteUrl} fullWidth />
        </motion.div>
      </motion.div>

      <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2 sm:right-6">
        <StartupActions
          startupId={startup.id}
          startupName={startup.name}
          shortDescription={startup.shortDescription}
          isAuthenticated={isAuthenticated}
          initialLiked={liked}
          initialSaved={saved}
          initialLikeCount={startup._count.likes}
          variant="rail"
        />
      </div>
    </section>
  );
}

function ScreenshotPreview({ startup }: { startup: StartupCardData }) {
  const url = startup.coverImageUrl ?? startup.images[0]?.url;
  if (url) {
    return (
      <div className="relative aspect-[4/3] w-full border border-border-strong shadow-2xl">
        <Image src={url} alt={`${startup.name} product screenshot`} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border border-border-strong bg-surface-2 shadow-2xl">
      <div className="h-10 w-10 rounded-xl bg-violet-gradient" />
      <p className="font-mono text-xs text-text-faint">No screenshot yet</p>
    </div>
  );
}
