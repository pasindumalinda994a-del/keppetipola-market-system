"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError, requestPasswordReset } from "@/lib/api";
import { translateAuthError } from "@/lib/i18n/messages";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      toast.success(t("auth.resetCodeSent"));
      router.push(
        `/reset-password?email=${encodeURIComponent(email.trim())}`
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? translateAuthError(err.message, t)
          : t("auth.error.server");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="guest-card mx-auto max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {t("auth.forgotPasswordTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("auth.forgotPasswordSubtitle")}
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
            className="h-11 rounded-lg bg-white px-3.5"
            autoComplete="email"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          variant="brand"
          className="mt-1 h-11 w-full"
        >
          {submitting ? t("auth.sendingResetCode") : t("auth.sendResetCode")}
        </Button>
      </form>

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
