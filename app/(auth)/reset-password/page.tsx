"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ApiError,
  requestPasswordReset,
  resetPasswordWithCode,
} from "@/lib/api";
import { fillTemplate, translateAuthError } from "@/lib/i18n/messages";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const RESEND_COOLDOWN_SECONDS = 60;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(
    searchParams.get("email") ? RESEND_COOLDOWN_SECONDS : 0
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      await resetPasswordWithCode({
        email: email.trim(),
        code: code.trim(),
        newPassword: password,
      });
      toast.success(t("auth.passwordResetSuccess"));
      router.push("/login");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? translateAuthError(err.message, t)
          : t("auth.error.resetFailed");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await requestPasswordReset(email.trim());
      toast.success(t("auth.resetCodeSent"));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? translateAuthError(err.message, t)
          : t("auth.error.server");
      toast.error(message);
    } finally {
      setResending(false);
    }
  }

  const fieldClass = "h-11 rounded-xl bg-background/70 px-3.5";

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border/80 bg-card/95 p-6 shadow-[0_20px_50px_-28px_rgba(15,15,15,0.35)] backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {t("auth.resetPasswordTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("auth.resetPasswordSubtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
          <Label htmlFor="code">{t("auth.resetCode")}</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            pattern="\d{6}"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder={t("auth.placeholder.resetCode")}
            className={`${fieldClass} tracking-[0.35em]`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.newPassword")}</Label>
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
          <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("auth.placeholder.confirmPassword")}
            className={fieldClass}
            autoComplete="new-password"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-1 h-11 w-full rounded-xl"
        >
          {submitting ? t("auth.resettingPassword") : t("auth.resetPassword")}
        </Button>
      </form>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || resending || !email.trim()}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0
            ? fillTemplate(t("auth.resendCodeIn"), { seconds: cooldown })
            : t("auth.resendCode")}
        </button>
      </div>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("auth.backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
