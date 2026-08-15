"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input, Label, ErrorText } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Something went wrong. Try again.");
      return;
    }
    router.push(searchParams.get("next") ?? "/");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-violet-glow" />

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-gradient">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-text">Hatch</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="mb-1 font-display text-xl font-bold text-text">Welcome back</h1>
          <p className="mb-6 text-sm text-text-dim">Log in to like and save startups.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              <ErrorText>{errors.email?.message}</ErrorText>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              <ErrorText>{errors.password?.message}</ErrorText>
            </div>

            {serverError && <p className="text-sm text-red-400">{serverError}</p>}

            <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-text-dim">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-violet-light hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
