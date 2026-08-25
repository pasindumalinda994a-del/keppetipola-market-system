"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Store, Wheat } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

const ACCEPT = ".jpg,.jpeg,.png,.pdf";
const fieldClass = "h-11 rounded-xl bg-background/70 px-3.5";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="border-b border-border/70 pb-2">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FileField({
  id,
  label,
  file,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        required
        accept={ACCEPT}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="h-11 rounded-xl bg-background/70 px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium"
      />
      <p className="text-xs text-muted-foreground">
        {file ? file.name : "JPG, PNG, or PDF · max 5 MB"}
      </p>
    </div>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const params = useSearchParams();
  const roleParam = params.get("role");
  const roleLocked = roleParam === "farmer" || roleParam === "trader";
  const [role, setRole] = useState<"farmer" | "trader">(
    roleLocked ? roleParam : "farmer"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [ruralServicesDivision, setRuralServicesDivision] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [identityFront, setIdentityFront] = useState<File | null>(null);
  const [identityBack, setIdentityBack] = useState<File | null>(null);
  const [taxBill, setTaxBill] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [showMismatch, setShowMismatch] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const mismatchVisible =
    showMismatch && confirmPassword.length > 0 && !passwordsMatch;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordsMatch) {
      setShowMismatch(true);
      toast.error("Passwords do not match");
      return;
    }
    if (!identityFront || !identityBack || !taxBill) {
      toast.error("Please upload identity photos and the tax bill");
      return;
    }
    setSubmitting(true);
    try {
      const message = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        address: address.trim(),
        ruralServicesDivision:
          role === "farmer" ? ruralServicesDivision.trim() : undefined,
        identityFront,
        identityBack,
        taxBill,
      });
      setSubmittedMessage(message);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not create account";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const roleLabel = role === "farmer" ? "Farmer" : "Trader";

  if (submittedMessage) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/80 bg-card/90 p-6 text-center shadow-[0_20px_50px_-28px_rgba(15,15,15,0.35)] backdrop-blur-sm sm:p-8">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
          Application submitted
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{submittedMessage}</p>
        <Button asChild size="lg" className="mt-6 h-11 w-full rounded-xl">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,15,15,0.35)] backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {roleLocked ? `Join as ${roleLabel}` : "Create account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Submit your details and documents. An admin must approve your
          application before you can log in.
        </p>
      </div>

      {!roleLocked ? (
        <div className="mb-6 grid grid-cols-2 gap-2.5">
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

      <form onSubmit={onSubmit} className="space-y-8">
        <Section title="Personal details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={fieldClass}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={fieldClass}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 …"
                className={fieldClass}
                autoComplete="tel"
              />
            </div>
            {role === "farmer" ? (
              <div className="space-y-2">
                <Label htmlFor="ruralServicesDivision">
                  Rural Services Division
                </Label>
                <Input
                  id="ruralServicesDivision"
                  required
                  value={ruralServicesDivision}
                  onChange={(e) => setRuralServicesDivision(e.target.value)}
                  placeholder="Your division"
                  className={fieldClass}
                />
              </div>
            ) : null}
            <div className={cn("space-y-2", role === "trader" && "sm:col-span-2")}>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, town"
                className={fieldClass}
                autoComplete="street-address"
              />
            </div>
          </div>
        </Section>

        <Section title="Account password">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={fieldClass}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setShowMismatch(true);
                }}
                placeholder="Re-enter password"
                className={fieldClass}
                autoComplete="new-password"
                aria-invalid={mismatchVisible}
              />
              {mismatchVisible ? (
                <p className="text-xs text-destructive">Passwords do not match</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Must match the password
                </p>
              )}
            </div>
          </div>
        </Section>

        <Section
          title="Documents"
          description="Upload both sides of your identity card and a tax bill."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FileField
              id="identityFront"
              label="Identity photo (front)"
              file={identityFront}
              onChange={setIdentityFront}
            />
            <FileField
              id="identityBack"
              label="Identity photo (back)"
              file={identityBack}
              onChange={setIdentityBack}
            />
            <div className="sm:col-span-2">
              <FileField
                id="taxBill"
                label="Tax bill photo"
                file={taxBill}
                onChange={setTaxBill}
              />
            </div>
          </div>
        </Section>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-11 w-full rounded-xl"
        >
          {submitting ? "Submitting…" : `Submit ${role} application`}
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
