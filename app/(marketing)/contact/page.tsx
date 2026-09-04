"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, fetchSettings, sendContactMessage } from "@/lib/api";
import { fillTemplate } from "@/lib/i18n/messages";
import { formatClockTime } from "@/lib/format";

export default function ContactPage() {
  const { t, locale } = useLocale();
  const [pending, setPending] = useState(false);
  const [marketName, setMarketName] = useState("Keppetipola Market");
  const [opensAt, setOpensAt] = useState("04:00");
  const [closesAt, setClosesAt] = useState("14:00");

  useEffect(() => {
    fetchSettings()
      .then(({ settings }) => {
        setMarketName(settings.marketName);
        setOpensAt(settings.opensAt);
        setClosesAt(settings.closesAt);
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;
    setPending(true);
    try {
      await sendContactMessage({ name, email, message });
      toast.success(t("contact.sent"));
      form.reset();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={t("contact.title")}
        description={t("contact.description")}
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-xl bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("contact.name")}</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("contact.email")}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("contact.message")}</Label>
            <Textarea id="message" name="message" rows={5} required />
          </div>
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? t("contact.sending") : t("contact.send")}
          </Button>
        </form>
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold">{t("contact.phone")}</h2>
            <p className="mt-1 text-muted-foreground">{t("contact.phoneValue")}</p>
          </div>
          <div>
            <h2 className="font-semibold">{t("contact.location")}</h2>
            <p className="mt-1 text-muted-foreground">
              {marketName}
              <br />
              {t("contact.address")}
              <br />
              {t("contact.addressLine")}
            </p>
          </div>
          <div>
            <h2 className="font-semibold">{t("contact.hours")}</h2>
            <p className="mt-1 text-muted-foreground">
              {fillTemplate(t("contact.hoursValue"), {
                open: formatClockTime(opensAt, locale),
                close: formatClockTime(closesAt, locale),
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
