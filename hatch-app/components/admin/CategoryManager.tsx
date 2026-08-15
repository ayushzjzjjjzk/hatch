"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

interface CategoryManagerProps {
  categories: { id: string; name: string; slug: string }[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() })
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Couldn't add category");
      return;
    }
    setName("");
    toast.success("Category added");
    router.refresh();
  }

  async function removeCategory(id: string) {
    setRemovingId(id);
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setRemovingId(null);
    if (!res.ok) {
      toast.error("Couldn't remove category");
      return;
    }
    toast.success("Category removed");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={addCategory} className="mb-6 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="max-w-xs" />
        <Button type="submit" variant="gradient" disabled={submitting}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-2 py-1.5 pl-3.5 pr-2 text-sm text-text">
            {c.name}
            <button
              onClick={() => removeCategory(c.id)}
              disabled={removingId === c.id}
              aria-label={`Remove ${c.name}`}
              className="focus-ring rounded-full p-0.5 text-text-faint hover:bg-white/[0.08] hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
