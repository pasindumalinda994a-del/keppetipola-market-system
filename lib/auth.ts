import type { User, UserRole } from "@/types";

export const AUTH_STORAGE_KEY = "keppetipola.auth";

export type StoredAuth = {
  token: string;
  user: User;
};

export function portalPathForRole(role: UserRole): string {
  if (role === "farmer") return "/farmer";
  if (role === "trader") return "/trader";
  return "/admin";
}

export function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user?.id || !parsed?.user?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function toIso(value: string | Date | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return new Date(value).toISOString();
}

/** Normalize API user so dates are always strings. */
export function normalizeUser(user: User): User {
  return {
    ...user,
    address: user.address ?? "",
    ruralServicesDivision: user.ruralServicesDivision ?? "",
    identityFrontUrl: user.identityFrontUrl ?? "",
    identityBackUrl: user.identityBackUrl ?? "",
    taxBillUrl: user.taxBillUrl ?? "",
    memberId: user.memberId ?? "",
    rejectionReason: user.rejectionReason ?? "",
    joinedAt: toIso(user.joinedAt) ?? new Date().toISOString(),
    reviewedAt: toIso(user.reviewedAt),
    notificationPrefs: {
      offerAlerts: user.notificationPrefs?.offerAlerts !== false,
      priceBookmarks: user.notificationPrefs?.priceBookmarks !== false,
      announcements: user.notificationPrefs?.announcements !== false,
      newApplications: user.notificationPrefs?.newApplications !== false,
      acceptedOffers: user.notificationPrefs?.acceptedOffers !== false,
    },
    bookmarkedVegetableIds: Array.isArray(user.bookmarkedVegetableIds)
      ? user.bookmarkedVegetableIds.map(String)
      : [],
  };
}
