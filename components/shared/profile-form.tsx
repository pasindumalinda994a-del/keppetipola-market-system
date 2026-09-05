"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { CompressError, prepareUploadFile } from "@/lib/compress-image";
import { profilePhotoSrc } from "@/lib/profile";

export function ProfileForm() {
  const { t } = useLocale();
  const {
    user,
    updateProfile,
    changePassword,
    uploadProfilePhoto,
    removeProfilePhoto,
  } = useAuth();
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const photoSrc = profilePhotoSrc(user.id, user.photoUrl);

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    try {
      const prepared = await prepareUploadFile(file, t("farmer.profile.photo"));
      await uploadProfilePhoto(prepared);
      toast.success(t("farmer.profile.photoUpdated"));
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof CompressError
          ? err.message
          : t("common.requestFailed");
      toast.error(message);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onRemovePhoto() {
    setPhotoBusy(true);
    try {
      await removeProfilePhoto();
      toast.success(t("farmer.profile.photoRemoved"));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t("common.requestFailed");
      toast.error(message);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const address = String(fd.get("address") || "").trim();
    const newPassword = String(fd.get("password") || "");
    const confirmPassword = String(fd.get("confirmPassword") || "");
    const currentPassword = String(fd.get("currentPassword") || "");

    if (newPassword && newPassword !== confirmPassword) {
      toast.error(t("farmer.profile.passwordMismatch"));
      return;
    }

    if (newPassword && !currentPassword) {
      toast.error(t("farmer.profile.currentPasswordRequired"));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name, phone, address });
      if (newPassword) {
        await changePassword(currentPassword, newPassword);
      }
      toast.success(t("farmer.profile.saved"));
      e.currentTarget.reset();
      const nameInput = e.currentTarget.elements.namedItem(
        "name"
      ) as HTMLInputElement;
      const phoneInput = e.currentTarget.elements.namedItem(
        "phone"
      ) as HTMLInputElement;
      const addressInput = e.currentTarget.elements.namedItem(
        "address"
      ) as HTMLInputElement;
      if (nameInput) nameInput.value = name;
      if (phoneInput) phoneInput.value = phone;
      if (addressInput) addressInput.value = address;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t("common.requestFailed");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <UserAvatar
          name={user.name}
          src={photoSrc}
          size="lg"
          className="size-20"
          fallbackClassName="bg-primary text-primary-foreground text-lg font-semibold"
        />
        <div className="min-w-0 space-y-2">
          <Label htmlFor="profilePhoto">{t("farmer.profile.photo")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("farmer.profile.photoHint")}
          </p>
          <input
            ref={photoInputRef}
            id="profilePhoto"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="sr-only"
            onChange={(e) => void onPhotoChange(e)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={photoBusy}
              onClick={() => photoInputRef.current?.click()}
            >
              {photoBusy
                ? t("farmer.profile.uploadingPhoto")
                : photoSrc
                  ? t("farmer.profile.changePhoto")
                  : t("farmer.profile.photo")}
            </Button>
            {photoSrc ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={photoBusy}
                onClick={() => void onRemovePhoto()}
              >
                {t("farmer.profile.removePhoto")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {user.memberId ? (
        <div className="space-y-2">
          <Label htmlFor="memberId">{t("common.memberId")}</Label>
          <Input id="memberId" value={user.memberId} disabled />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">{t("farmer.profile.fullName")}</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("common.phone")}</Label>
        <Input id="phone" name="phone" defaultValue={user.phone} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("common.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">{t("common.address")}</Label>
        <Input id="address" name="address" defaultValue={user.address} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bank">{t("farmer.profile.bankDetails")}</Label>
        <Input id="bank" placeholder={t("common.comingSoon")} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">
          {t("farmer.profile.currentPassword")}
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("farmer.profile.newPassword")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={t("farmer.profile.passwordPlaceholder")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          {t("farmer.profile.confirmPassword")}
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" disabled={saving || photoBusy}>
        {saving ? t("common.saving") : t("farmer.profile.save")}
      </Button>
    </form>
  );
}
