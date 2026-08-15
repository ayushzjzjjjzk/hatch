"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { startupSchema, type StartupInput } from "@/lib/validations/startup";
import { slugify, EMPLOYEE_RANGES } from "@/lib/utils";
import { Input, Textarea, Label, Select, ErrorText, Switch } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { ImageUploader, GalleryUploader } from "./ImageUploader";
import { FounderFieldArray } from "./FounderFieldArray";

interface StartupFormProps {
  categories: { id: string; name: string; slug: string }[];
  defaultValues?: Partial<StartupInput>;
  startupId?: string; // present when editing
}

const emptyFounder = { name: "", role: "", displayOrder: 0 };

export function StartupForm({ categories, defaultValues, startupId }: StartupFormProps) {
  const router = useRouter();
  const isEditing = !!startupId;
  const [slugTouched, setSlugTouched] = useState(isEditing);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<StartupInput>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      websiteUrl: "",
      ycBatch: "",
      status: "DRAFT",
      featured: false,
      displayOrder: 0,
      categoryIds: [],
      founders: [emptyFounder],
      images: [],
      ...defaultValues
    }
  });

  const name = watch("name");
  useEffect(() => {
    if (!slugTouched && name) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  const categoryIds = watch("categoryIds");
  function toggleCategory(id: string) {
    const next = categoryIds.includes(id) ? categoryIds.filter((c) => c !== id) : [...categoryIds, id];
    setValue("categoryIds", next, { shouldValidate: true });
  }

  async function submit(data: StartupInput, status: "DRAFT" | "PUBLISHED") {
    const payload = { ...data, status };
    const url = isEditing ? `/api/startups/${startupId}` : "/api/startups";
    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Something went wrong");
      return;
    }

    toast.success(status === "PUBLISHED" ? "Startup published" : "Draft saved");
    router.push("/admin/startups");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
      <Section title="Startup Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Startup Name</Label>
            <Input id="name" {...register("name")} />
            <ErrorText>{errors.name?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              onChange={(e) => {
                setSlugTouched(true);
                register("slug").onChange(e);
              }}
            />
            <ErrorText>{errors.slug?.message}</ErrorText>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea id="shortDescription" rows={2} placeholder="One sentence - shown in the feed and cards" {...register("shortDescription")} />
            <ErrorText>{errors.shortDescription?.message}</ErrorText>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea id="description" rows={5} placeholder="Shown on the startup's full profile page" {...register("description")} />
            <ErrorText>{errors.description?.message}</ErrorText>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input id="websiteUrl" placeholder="https://..." {...register("websiteUrl")} />
            <ErrorText>{errors.websiteUrl?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="ycBatch">YC Batch</Label>
            <Input id="ycBatch" placeholder="e.g. W26" {...register("ycBatch")} />
            <ErrorText>{errors.ycBatch?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="San Francisco, CA" {...register("location")} />
            <ErrorText>{errors.location?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input id="foundedYear" type="number" {...register("foundedYear", { valueAsNumber: true })} />
            <ErrorText>{errors.foundedYear?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="employeeRange">Employee Range</Label>
            <Select id="employeeRange" defaultValue="" {...register("employeeRange")}>
              <option value="">Not specified</option>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleCategory(c.id)}
                className={
                  categoryIds.includes(c.id)
                    ? "focus-ring rounded-full border border-violet/50 bg-violet/15 px-3 py-1.5 text-xs font-medium text-violet-light"
                    : "focus-ring rounded-full border border-border-strong bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-dim hover:text-text"
                }
              >
                {c.name}
              </button>
            ))}
          </div>
          <ErrorText>{errors.categoryIds?.message}</ErrorText>
        </div>
      </Section>

      <Section title="Company Social Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input id="linkedinUrl" placeholder="https://linkedin.com/company/..." {...register("linkedinUrl")} />
            <ErrorText>{errors.linkedinUrl?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="xUrl">X</Label>
            <Input id="xUrl" placeholder="https://x.com/..." {...register("xUrl")} />
            <ErrorText>{errors.xUrl?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="githubUrl">GitHub</Label>
            <Input id="githubUrl" placeholder="https://github.com/..." {...register("githubUrl")} />
            <ErrorText>{errors.githubUrl?.message}</ErrorText>
          </div>
          <div>
            <Label htmlFor="youtubeUrl">YouTube</Label>
            <Input id="youtubeUrl" placeholder="https://youtube.com/@..." {...register("youtubeUrl")} />
            <ErrorText>{errors.youtubeUrl?.message}</ErrorText>
          </div>
        </div>
      </Section>

      <Section title="Media">
        <div className="mb-5 flex flex-wrap gap-6">
          <ImageUploader bucket="logos" label="Logo" value={watch("logoUrl")} onChange={(url) => setValue("logoUrl", url ?? "")} />
          <ImageUploader
            bucket="images"
            label="Cover / main screenshot"
            aspect="video"
            value={watch("coverImageUrl")}
            onChange={(url) => setValue("coverImageUrl", url ?? "")}
          />
        </div>
        <Label>Additional Screenshots</Label>
        <GalleryUploader
          bucket="images"
          images={watch("images")}
          onChange={(imgs) => setValue("images", imgs.map((img, i) => ({ ...img, displayOrder: i })))}
        />
      </Section>

      <Section title="Founders">
        <FounderFieldArray control={control} register={register} errors={errors} setValue={setValue} watch={watch} />
      </Section>

      <Section title="Publishing">
        <div className="flex flex-wrap items-center gap-6">
          <Switch checked={watch("featured")} onCheckedChange={(v) => setValue("featured", v)} label="Featured" />
          <div className="w-40">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" type="number" {...register("displayOrder", { valueAsNumber: true })} />
          </div>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-border bg-bg/95 px-6 py-4 backdrop-blur-lg lg:-mx-8 lg:px-8">
        <Button type="button" variant="outline" size="lg" disabled={isSubmitting} onClick={handleSubmit((data) => submit(data, "DRAFT"))}>
          Save Draft
        </Button>
        <Button type="button" variant="gradient" size="lg" disabled={isSubmitting} onClick={handleSubmit((data) => submit(data, "PUBLISHED"))}>
          {isSubmitting ? "Saving..." : "Publish Startup"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-violet-light">{title}</h2>
      {children}
    </section>
  );
}
