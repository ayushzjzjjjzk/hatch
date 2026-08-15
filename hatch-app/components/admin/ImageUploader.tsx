"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { uploadImage, type UploadBucket } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

export function ImageUploader({
  bucket,
  value,
  onChange,
  label,
  aspect = "square"
}: {
  bucket: UploadBucket;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label: string;
  aspect?: "square" | "video";
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      onChange(await uploadImage(bucket, file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-text-dim">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={cn(
          "focus-ring relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors",
          aspect === "square" ? "h-28 w-28" : "aspect-video w-full",
          dragOver ? "border-violet bg-violet/10" : "border-border-strong bg-surface-2 hover:border-violet/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-text-faint" />
        ) : value ? (
          <>
            <Image src={value} alt={label} fill className="object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
              aria-label={`Remove ${label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-text-faint">
            <Upload className="h-5 w-5" />
            <span className="text-[11px]">Upload</span>
          </div>
        )}
      </div>
    </div>
  );
}

export interface GalleryImage {
  url: string;
  alt?: string;
}

export function GalleryUploader({
  bucket,
  images,
  onChange
}: {
  bucket: UploadBucket;
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadImage(bucket, f)));
      onChange([...images, ...uploaded.map((url) => ({ url }))]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img.url + i} className="relative h-24 w-32 overflow-hidden rounded-xl border border-border-strong">
            <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-1.5 py-1">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white disabled:opacity-30" aria-label="Move earlier">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="text-white disabled:opacity-30" aria-label="Move later">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button type="button" onClick={() => remove(i)} className="text-white" aria-label="Remove image">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="focus-ring flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-text-faint hover:border-violet/50"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span className="text-[11px]">Add images</span>
            </>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-text-faint">Use the arrows to reorder. JPG, PNG, or WEBP, up to 5MB each.</p>
    </div>
  );
}
