"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Store, Wheat } from "lucide-react";
import { portalPathForRole } from "@/lib/mock-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role");
  const roleLocked = roleParam === "farmer" || roleParam === "trader";
  const [role, setRole] = useState<"farmer" | "trader">(
    roleLocked ? roleParam : "farmer"
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Account created (demo)");
    router.push(portalPathForRole(role));
  }

  const roleLabel = role === "farmer" ? "Farmer" : "Trader";

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,15,15,0.35)] backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {roleLocked ? `Join as ${roleLabel}` : "Create account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {roleLocked
            ? "A few details and you're in. Takes under a minute."
            : "Join as a farmer or trader. Takes under a minute."}
        </p>
      </div>

      {!roleLocked ? (
        <div className="mb-5 grid grid-cols-2 gap-2.5">
          {(
            [
              { id: "farmer" as const, label: "Farmer", icon: Wheat },
              { id: "trader" as const, label: "Trader", icon: Store },
            ] as const
          ).map((r) => {
            const Icon = r.icon;
            const selected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/50 text-foreground hover:bg-accent/60"
                )}
              >
                <Icon className="size-4" />
                {r.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            placeholder="Your name"
            className="h-11 rounded-xl bg-background/70 px-3.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            placeholder="+94 …"
            className="h-11 rounded-xl bg-background/70 px-3.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-background/70 px-3.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            className="h-11 rounded-xl bg-background/70 px-3.5"
          />
        </div>
        <Button type="submit" size="lg" className="mt-1 h-11 w-full rounded-xl">
          Create {role} account
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
