"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Store, Wheat } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  CompressError,
  prepareRegistrationFiles,
} from "@/lib/compress-image";
import { fillTemplate, translateAuthError } from "@/lib/i18n/messages";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
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
  const { t } = useLocale();
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
        {file ? file.name : t("auth.doc.fileHint")}
      </p>
    </div>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const { t } = useLocale();
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
  const [submitted, setSubmitted] = useState<{
    memberId?: string;
  } | null>(null);
  const [showMismatch, setShowMismatch] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const mismatchVisible =
    showMismatch && confirmPassword.length > 0 && !passwordsMatch;
  const roleLabel =
    role === "farmer" ? t("common.farmer") : t("common.trader");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordsMatch) {
      setShowMismatch(true);
      toast.error(t("auth.passwordMismatch"));
      return;
    }
    if (!identityFront || !identityBack || !taxBill) {
      toast.error(t("auth.error.missingDocuments"));
      return;
    }
    setSubmitting(true);
    try {
      const documents = await prepareRegistrationFiles({
        identityFront,
        identityBack,
        taxBill,
      });
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        address: address.trim(),
        ruralServicesDivision:
          role === "farmer" ? ruralServicesDivision.trim() : undefined,
        identityFront: documents.identityFront,
        identityBack: documents.identityBack,
        taxBill: documents.taxBill,
      });
      setSubmitted({
        memberId: data.user.memberId,
      });
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof CompressError
          ? translateAuthError(err.message, t)
          : t("auth.error.createAccount");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/80 bg-card/90 p-6 text-center shadow-[0_20px_50px_-28px_rgba(15,15,15,0.35)] backdrop-blur-sm sm:p-8">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
          {t("auth.applicationSubmitted")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.register.successMessage")}
        </p>
        {submitted.memberId ? (
          <p className="mt-4 rounded-xl bg-muted/70 px-4 py-3 font-mono text-lg font-semibold tracking-wide text-foreground">
            {fillTemplate(t("auth.yourMemberId"), { role: roleLabel })}:{" "}
            {submitted.memberId}
          </p>
        ) : null}
        <Button asChild size="lg" className="mt-6 h-11 w-full rounded-xl">
          <Link href="/login">{t("auth.goToLogin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,15,15,0.35)] backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {roleLocked
            ? fillTemplate(t("auth.joinAs"), { role: roleLabel })
            : t("auth.createAccount")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("auth.registerSubtitle")}
        </p>
      </div>

      {!roleLocked ? (
        <div className="mb-6 grid grid-cols-2 gap-2.5">
          {(
            [
              { id: "farmer" as const, labelKey: "common.farmer" as const, icon: Wheat },
              { id: "trader" as const, labelKey: "common.trader" as const, icon: Store },
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
                {t(r.labelKey)}
              </button>
            );
          })}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-8">
        <Section title={t("auth.personalDetails")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("farmer.profile.fullName")}</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("auth.placeholder.name")}
                className={fieldClass}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.placeholder.email")}
                className={fieldClass}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("auth.placeholder.phone")}
                className={fieldClass}
                autoComplete="tel"
              />
            </div>
            {role === "farmer" ? (
              <div className="space-y-2">
                <Label htmlFor="ruralServicesDivision">
                  {t("common.ruralServicesDivision")}
                </Label>
                <Input
                  id="ruralServicesDivision"
                  required
                  value={ruralServicesDivision}
                  onChange={(e) => setRuralServicesDivision(e.target.value)}
                  placeholder={t("auth.placeholder.division")}
                  className={fieldClass}
                />
              </div>
            ) : null}
            <div className={cn("space-y-2", role === "trader" && "sm:col-span-2")}>
              <Label htmlFor="address">{t("common.address")}</Label>
              <Input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("auth.placeholder.address")}
                className={fieldClass}
                autoComplete="street-address"
              />
            </div>
          </div>
        </Section>

        <Section title={t("auth.accountPassword")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <PasswordInput
                id="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.placeholder.passwordMin")}
                className={fieldClass}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("auth.confirmPassword")}
              </Label>
              <PasswordInput
                id="confirmPassword"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setShowMismatch(true);
                }}
                placeholder={t("auth.placeholder.confirmPassword")}
                className={fieldClass}
                autoComplete="new-password"
                aria-invalid={mismatchVisible}
              />
              {mismatchVisible ? (
                <p className="text-xs text-destructive">
                  {t("auth.passwordMismatch")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("auth.passwordMustMatch")}
                </p>
              )}
            </div>
          </div>
        </Section>

        <Section
          title={t("common.documents")}
          description={t("auth.documentsHint")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FileField
              id="identityFront"
              label={t("auth.doc.identityFront")}
              file={identityFront}
              onChange={setIdentityFront}
            />
            <FileField
              id="identityBack"
              label={t("auth.doc.identityBack")}
              file={identityBack}
              onChange={setIdentityBack}
            />
            <div className="sm:col-span-2">
              <FileField
                id="taxBill"
                label={t("auth.doc.taxBill")}
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
          {submitting
            ? t("common.submitting")
            : fillTemplate(t("auth.submitApplication"), { role: roleLabel })}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t("auth.alreadyRegistered")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("status.login")}
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
