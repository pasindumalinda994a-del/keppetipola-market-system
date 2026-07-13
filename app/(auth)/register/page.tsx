"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { portalPathForRole } from "@/lib/mock-auth";
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
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initial: "farmer" | "trader" =
    params.get("role") === "trader" ? "trader" : "farmer";
  const [role, setRole] = useState<"farmer" | "trader">(initial);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Account created (demo)");
    router.push(portalPathForRole(role));
  }

  return (
    <Card className="w-full max-w-md shadow-none">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Join as a farmer or trader. Takes under a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["farmer", "trader"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors",
                role === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" required placeholder="+94 …" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} />
          </div>
          <Button type="submit" className="w-full">
            Create {role} account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="ml-1 font-medium text-primary">
          Login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
