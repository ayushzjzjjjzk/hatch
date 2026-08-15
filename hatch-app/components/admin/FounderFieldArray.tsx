"use client";

import { useFieldArray, type Control, type UseFormRegister, type FieldErrors, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import type { StartupInput } from "@/lib/validations/startup";
import { Input, Textarea, Label, Select, ErrorText } from "@/components/ui/form-fields";
import { ImageUploader } from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { FOUNDER_ROLES } from "@/lib/utils";

export function FounderFieldArray({
  control,
  register,
  errors,
  setValue,
  watch
}: {
  control: Control<StartupInput>;
  register: UseFormRegister<StartupInput>;
  errors: FieldErrors<StartupInput>;
  setValue: UseFormSetValue<StartupInput>;
  watch: UseFormWatch<StartupInput>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "founders" });
  const arrayError = (errors.founders as unknown as { message?: string })?.message;

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-2xl border border-border bg-surface-2 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-text">
              <GripVertical className="h-4 w-4 text-text-faint" />
              Founder {index + 1}
            </p>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)} className="text-text-faint hover:text-red-400" aria-label="Remove founder">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mb-3">
            <ImageUploader
              bucket="founders"
              label="Photo"
              value={watch(`founders.${index}.photoUrl`)}
              onChange={(url) => setValue(`founders.${index}.photoUrl`, url ?? "")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input {...register(`founders.${index}.name`)} />
              <ErrorText>{errors.founders?.[index]?.name?.message}</ErrorText>
            </div>
            <div>
              <Label>Role</Label>
              <Select {...register(`founders.${index}.role`)} defaultValue="">
                <option value="" disabled>
                  Select a role
                </option>
                {FOUNDER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
              <ErrorText>{errors.founders?.[index]?.role?.message}</ErrorText>
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input placeholder="https://linkedin.com/in/..." {...register(`founders.${index}.linkedinUrl`)} />
              <ErrorText>{errors.founders?.[index]?.linkedinUrl?.message}</ErrorText>
            </div>
            <div>
              <Label>X / Twitter</Label>
              <Input placeholder="https://x.com/..." {...register(`founders.${index}.xUrl`)} />
              <ErrorText>{errors.founders?.[index]?.xUrl?.message}</ErrorText>
            </div>
            <div className="sm:col-span-2">
              <Label>Personal website</Label>
              <Input placeholder="https://..." {...register(`founders.${index}.websiteUrl`)} />
              <ErrorText>{errors.founders?.[index]?.websiteUrl?.message}</ErrorText>
            </div>
            <div className="sm:col-span-2">
              <Label>Short bio</Label>
              <Textarea rows={2} {...register(`founders.${index}.bio`)} />
              <ErrorText>{errors.founders?.[index]?.bio?.message}</ErrorText>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: "", role: "", displayOrder: fields.length })}
        className="self-start"
      >
        <Plus className="h-4 w-4" />
        Add Founder
      </Button>
      {arrayError && <ErrorText>{arrayError}</ErrorText>}
    </div>
  );
}
