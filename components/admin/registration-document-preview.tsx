"use client";

import { useEffect, useState } from "react";
import { ApiError, fetchUserDocument } from "@/lib/api";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

export function RegistrationDocumentPreview({
  token,
  userId,
  kind,
  label,
  hasFile,
}: {
  token: string;
  userId: string;
  kind: "identityFront" | "identityBack" | "taxBill";
  label: string;
  hasFile: boolean;
}) {
  const { t } = useLocale();
  const [url, setUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFile) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      try {
        const { blob, contentType } = await fetchUserDocument(
          token,
          userId,
          kind
        );
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setIsPdf(contentType.includes("pdf") || blob.type.includes("pdf"));
        setUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t("common.requestFailed")
          );
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [hasFile, token, userId, kind, t]);

  return (
    <article className="rounded-lg border border-border/70 bg-background/40 p-4">
      <p className="text-sm font-medium">{label}</p>
      {!hasFile ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("admin.users.noDocuments")}
        </p>
      ) : error ? (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      ) : !url ? (
        <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
      ) : isPdf ? (
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            {t("admin.users.openPdf")}
          </a>
        </Button>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={label}
          className="mt-3 max-h-64 w-full rounded-md border object-contain bg-muted/40"
        />
      )}
    </article>
  );
}
