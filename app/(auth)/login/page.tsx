"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { portalPathForRole } from "@/lib/auth";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name}`);
      router.push(portalPathForRole(user.role));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not sign in";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,15,15,0.35)] backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to continue to your portal.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-background/70 px-3.5"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 rounded-xl bg-background/70 px-3.5"
            autoComplete="current-password"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-1 h-11 w-full rounded-xl"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
