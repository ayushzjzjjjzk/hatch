"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Eye, Upload, Download } from "lucide-react";
import type { StartupCardData } from "@/lib/types";
import { initials, formatCount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function StartupTable({ startups }: { startups: StartupCardData[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<StartupCardData | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleStatus(startup: StartupCardData) {
    setBusyId(startup.id);
    const nextStatus = startup.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/startups/${startup.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error("Couldn't update status");
      return;
    }
    toast.success(nextStatus === "PUBLISHED" ? "Published" : "Moved to draft");
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    const res = await fetch(`/api/startups/${pendingDelete.id}`, { method: "DELETE" });
    setBusyId(null);
    setPendingDelete(null);
    if (!res.ok) {
      toast.error("Couldn't delete startup");
      return;
    }
    toast.success("Startup deleted");
    router.refresh();
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-text-faint">
              <th className="px-4 py-3 font-medium">Startup</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Likes</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {startups.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {s.logoUrl ? (
                      <Image src={s.logoUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-lg border border-border-strong object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-gradient text-[10px] font-bold text-white">
                        {initials(s.name)}
                      </div>
                    )}
                    <span className="font-medium text-text">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-dim">{s.ycBatch}</td>
                <td className="px-4 py-3 text-text-dim">{s.categories[0]?.category.name ?? "-"}</td>
                <td className="px-4 py-3 text-text-dim">{s.location ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={s.status === "PUBLISHED" ? "violet" : "default"} size="sm">
                    {s.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-dim">{formatCount(s._count.views)}</td>
                <td className="px-4 py-3 text-text-dim">{formatCount(s._count.likes)}</td>
                <td className="px-4 py-3 text-text-dim">{formatCount(s._count.clicks)}</td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus-ring rounded-lg p-1.5 text-text-faint hover:bg-white/[0.08] hover:text-text" disabled={busyId === s.id} aria-label="Row actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/startups/${s.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/startup/${s.slug}`} target="_blank">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(s)}>
                        {s.status === "PUBLISHED" ? (
                          <>
                            <Download className="h-3.5 w-3.5" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" /> Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setPendingDelete(s)} className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogTitle>Delete startup?</DialogTitle>
          <DialogDescription>
            This will permanently remove <span className="text-text">{pendingDelete?.name}</span>&apos;s startup information, founders, images,
            likes, saves, and analytics.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busyId === pendingDelete?.id}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
