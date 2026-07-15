"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Store, UserRound, Wheat } from "lucide-react";
import { portalPathForRole } from "@/lib/mock-auth";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const demos: {
  role: UserRole;
  label: string;
  hint: string;
  icon: typeof Wheat;
}[] = [
  { role: "farmer", label: "Farmer", hint: "List harvest & offers", icon: Wheat },
  { role: "trader", label: "Trader", hint: "Send requests & buy", icon: Store },
  { role: "admin", label: "Admin", hint: "Manage the market", icon: UserRound },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function demoLogin(role: UserRole) {
    toast.success(`Signed in as ${role}`);
    router.push(portalPathForRole(role));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.message("Demo mode", {
      description: "Use a role button below — no backend yet.",
    });
    demoLogin("farmer");
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-background/70 px-3.5"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span className="text-xs text-muted-foreground">Demo — any password</span>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-11 rounded-xl bg-background/70 px-3.5"
          />
        </div>
        <Button type="submit" size="lg" className="mt-1 h-11 w-full rounded-xl">
          Sign in
        </Button>
      </form>

      <div className="mt-7 grid gap-2.5">
        {demos.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.role}
              type="button"
              onClick={() => demoLogin(d.role)}
              className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 px-3.5 py-3 text-left transition-colors hover:border-primary/35 hover:bg-accent/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary transition-colors group-hover:bg-primary/18">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Continue as {d.label}
                </span>
                <span className="block text-xs text-muted-foreground">{d.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

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
