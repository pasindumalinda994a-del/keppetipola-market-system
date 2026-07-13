"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { portalPathForRole } from "@/lib/mock-auth";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const demos: { role: UserRole; label: string }[] = [
  { role: "farmer", label: "Continue as Farmer" },
  { role: "trader", label: "Continue as Trader" },
  { role: "admin", label: "Continue as Admin" },
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Sign in to list harvest, send offers, or manage the market.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Demo access</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-2">
          {demos.map((d) => (
            <Button
              key={d.role}
              type="button"
              variant="outline"
              onClick={() => demoLogin(d.role)}
            >
              {d.label}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="ml-1 font-medium text-primary">
          Register
        </Link>
      </CardFooter>
    </Card>
  );
}
