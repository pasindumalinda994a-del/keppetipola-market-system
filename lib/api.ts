import type {
  AccountStatus,
  Announcement,
  Application,
  BuyingRequest,
  ContactMessage,
  Harvest,
  LoyaltyBalance,
  LoyaltyRule,
  MarketPrice,
  MarketSettings,
  PriceHistoryPoint,
  PriceHistoryRange,
  NotificationItem,
  NotificationPrefs,
  Offer,
  Sale,
  SalesReport,
  Stall,
  SystemLog,
  User,
  UserRole,
  Vegetable,
} from "@/types";

export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
}

const API_BASE = getApiBase();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token }: ApiFetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Request failed";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export type AuthResponse = {
  user: User;
  token: string;
};

export type MeResponse = {
  user: User;
};

export type RegisterResponse = {
  user: User;
  message: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<UserRole, "farmer" | "trader">;
  address: string;
  ruralServicesDivision?: string;
  identityFront: File;
  identityBack: File;
  taxBill: File;
};

export async function registerAccount(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const form = new FormData();
  form.set("name", payload.name);
  form.set("email", payload.email);
  form.set("phone", payload.phone);
  form.set("password", payload.password);
  form.set("role", payload.role);
  form.set("address", payload.address);
  if (payload.ruralServicesDivision) {
    form.set("ruralServicesDivision", payload.ruralServicesDivision);
  }
  form.set("identityFront", payload.identityFront);
  form.set("identityBack", payload.identityBack);
  form.set("taxBill", payload.taxBill);

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Request failed";
    throw new ApiError(message, res.status);
  }

  return data as RegisterResponse;
}

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  address?: string;
  notificationPrefs?: Partial<NotificationPrefs>;
};

export type UsersResponse = {
  users: User[];
};

export type UserResponse = {
  user: User;
};

export type VegetablesResponse = {
  vegetables: Vegetable[];
};

export type VegetableResponse = {
  vegetable: Vegetable;
};

export type PricesResponse = {
  prices: MarketPrice[];
};

export type PriceResponse = {
  price: MarketPrice;
};

export function updateProfile(token: string, payload: UpdateProfilePayload) {
  return apiFetch<UserResponse>("/auth/me", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function saveBookmarks(token: string, vegetableIds: string[]) {
  return apiFetch<UserResponse>("/bookmarks", {
    method: "PUT",
    body: { vegetableIds },
    token,
  });
}

export function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string }
) {
  return apiFetch<{ message: string }>("/auth/me/password", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function fetchUsers(token: string) {
  return apiFetch<UsersResponse>("/users", { token });
}

export function fetchUser(token: string, id: string) {
  return apiFetch<UserResponse>(`/users/${id}`, { token });
}

export async function fetchUserDocument(
  token: string,
  userId: string,
  kind: "identityFront" | "identityBack" | "taxBill"
): Promise<{ blob: Blob; contentType: string }> {
  const res = await fetch(`${API_BASE}/api/users/${userId}/documents/${kind}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let message = "Document not found";
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, res.status);
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const blob = await res.blob();
  return { blob, contentType };
}

export function updateUserStatus(
  token: string,
  id: string,
  status: AccountStatus,
  rejectionReason?: string
) {
  return apiFetch<UserResponse>(`/users/${id}/status`, {
    method: "PATCH",
    body: { status, rejectionReason },
    token,
  });
}

export function fetchVegetables() {
  return apiFetch<VegetablesResponse>("/vegetables");
}

export function fetchAllVegetables(token: string) {
  return apiFetch<VegetablesResponse>("/vegetables/all", { token });
}

export function createVegetable(
  token: string,
  body: { name: string; category: string; unit?: string; imageUrl?: string }
) {
  return apiFetch<VegetableResponse>("/vegetables", {
    method: "POST",
    body,
    token,
  });
}

export function updateVegetable(
  token: string,
  id: string,
  body: Partial<{
    name: string;
    category: string;
    unit: string;
    status: "Active" | "Inactive";
    imageUrl: string;
  }>
) {
  return apiFetch<VegetableResponse>(`/vegetables/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}

export function fetchPrices() {
  return apiFetch<PricesResponse>("/prices");
}

export function updatePrice(
  token: string,
  vegetableId: string,
  body: { lowest: number; highest: number }
) {
  return apiFetch<PriceResponse>(`/prices/${vegetableId}`, {
    method: "PATCH",
    body,
    token,
  });
}

export type PriceHistoryResponse = {
  histories: Record<string, PriceHistoryPoint[]>;
};

export function fetchPriceHistory(
  ids: string[],
  range: PriceHistoryRange = "week"
) {
  const params = new URLSearchParams();
  if (ids.length) params.set("ids", ids.join(","));
  params.set("range", range);
  return apiFetch<PriceHistoryResponse>(`/prices/history?${params}`);
}

export type HarvestsResponse = { harvests: Harvest[] };
export type HarvestResponse = { harvest: Harvest; offers?: Offer[] };
export type OffersResponse = { offers: Offer[] };
export type OfferResponse = { offer: Offer };
export type RequestsResponse = { requests: BuyingRequest[] };
export type RequestResponse = { request: BuyingRequest };
export type ApplicationsResponse = { applications: Application[] };
export type ApplicationResponse = { application: Application };
export type SalesResponse = { sales: Sale[] };
export type SaleResponse = { sale: Sale };
export type NotificationsResponse = {
  notifications: NotificationItem[];
  unread: number;
};

export function fetchHarvests(
  token: string,
  query: { mine?: boolean; vegetableId?: string } = {}
) {
  const params = new URLSearchParams();
  if (query.mine) params.set("mine", "1");
  if (query.vegetableId) params.set("vegetableId", query.vegetableId);
  const qs = params.toString();
  return apiFetch<HarvestsResponse>(`/harvests${qs ? `?${qs}` : ""}`, { token });
}

export function fetchHarvest(token: string, id: string) {
  return apiFetch<HarvestResponse>(`/harvests/${id}`, { token });
}

export async function createHarvest(
  token: string,
  payload: {
    vegetableId: string;
    quantityKg: number;
    qualityGrade: string;
    harvestDate: string;
    expectedDelivery: string;
    availableUntil: string;
    photos?: FileList | File[];
  }
): Promise<HarvestResponse> {
  const form = new FormData();
  form.set("vegetableId", payload.vegetableId);
  form.set("quantityKg", String(payload.quantityKg));
  form.set("qualityGrade", payload.qualityGrade);
  form.set("harvestDate", payload.harvestDate);
  form.set("expectedDelivery", payload.expectedDelivery);
  form.set("availableUntil", payload.availableUntil);
  const photos = payload.photos
    ? Array.from(payload.photos).filter((f) => f.size > 0)
    : [];
  for (const photo of photos) {
    form.append("photos", photo);
  }

  const res = await fetch(`${API_BASE}/api/harvests`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Request failed";
    throw new ApiError(message, res.status);
  }

  return data as HarvestResponse;
}

export function updateHarvest(
  token: string,
  id: string,
  body: Partial<{
    vegetableId: string;
    quantityKg: number;
    qualityGrade: string;
    harvestDate: string;
    expectedDelivery: string;
    availableUntil: string;
    status: "Closed" | "Cancelled";
  }>
) {
  return apiFetch<HarvestResponse>(`/harvests/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}

export function deleteHarvest(token: string, id: string) {
  return apiFetch<{ message: string }>(`/harvests/${id}`, {
    method: "DELETE",
    token,
  });
}

export function createHarvestOffer(
  token: string,
  harvestId: string,
  body: {
    price: number;
    quantityKg: number;
    delivery: string;
    message?: string;
  }
) {
  return apiFetch<OfferResponse>(`/harvests/${harvestId}/offers`, {
    method: "POST",
    body,
    token,
  });
}

export function fetchRequests(
  token?: string | null,
  query: { mine?: boolean } = {}
) {
  const params = new URLSearchParams();
  if (query.mine) params.set("mine", "1");
  const qs = params.toString();
  return apiFetch<RequestsResponse>(`/requests${qs ? `?${qs}` : ""}`, {
    token: token ?? undefined,
  });
}

export function createBuyingRequest(
  token: string,
  body: {
    vegetableId: string;
    quantityKg: number;
    minPrice: number;
    maxPrice: number;
    preferredGrade: string;
    pickupDate: string;
    closingTime: string;
    notes?: string;
  }
) {
  return apiFetch<RequestResponse>("/requests", {
    method: "POST",
    body,
    token,
  });
}

export function closeBuyingRequest(
  token: string,
  id: string,
  status: "Closed" | "Cancelled" = "Closed"
) {
  return apiFetch<RequestResponse>(`/requests/${id}`, {
    method: "PATCH",
    body: { status },
    token,
  });
}

export function applyToRequest(
  token: string,
  requestId: string,
  body: { quantityKg: number; grade: string; harvestDate: string }
) {
  return apiFetch<ApplicationResponse>(
    `/requests/${requestId}/applications`,
    { method: "POST", body, token }
  );
}

export function fetchApplications(token: string) {
  return apiFetch<ApplicationsResponse>("/applications", { token });
}

export function rejectApplication(token: string, id: string) {
  return apiFetch<ApplicationResponse>(`/applications/${id}`, {
    method: "PATCH",
    body: { status: "Cancelled" },
    token,
  });
}

export function sendApplicationOffer(
  token: string,
  applicationId: string,
  body: {
    price: number;
    quantityKg: number;
    delivery: string;
    message?: string;
  }
) {
  return apiFetch<OfferResponse>(`/applications/${applicationId}/offer`, {
    method: "POST",
    body,
    token,
  });
}

export function fetchOffers(token: string, harvestId?: string) {
  const qs = harvestId ? `?harvestId=${encodeURIComponent(harvestId)}` : "";
  return apiFetch<OffersResponse>(`/offers${qs}`, { token });
}

export function respondToOffer(
  token: string,
  id: string,
  action: "accept" | "reject"
) {
  return apiFetch<SaleResponse | OfferResponse>(`/offers/${id}`, {
    method: "PATCH",
    body: { action },
    token,
  });
}

export function fetchSales(token: string, status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<SalesResponse>(`/sales${qs}`, { token });
}

export function fetchSale(token: string, id: string) {
  return apiFetch<SaleResponse>(`/sales/${id}`, { token });
}

export function completeSale(token: string, id: string) {
  return apiFetch<SaleResponse>(`/sales/${id}`, {
    method: "PATCH",
    body: { status: "Completed" },
    token,
  });
}

export function fetchNotifications(token: string) {
  return apiFetch<NotificationsResponse>("/notifications", { token });
}

export function markNotificationsRead(token: string, ids?: string[]) {
  return apiFetch<{ message: string }>("/notifications", {
    method: "PATCH",
    body: ids ? { ids } : {},
    token,
  });
}

export type LoyaltyRuleResponse = {
  rule: LoyaltyRule;
  isDefault?: boolean;
};

export type LoyaltyBalancesResponse = {
  balances: LoyaltyBalance[];
  stats: {
    enrolled: number;
    rewardsReady: number;
    avgTokens: number;
  };
};

export function fetchLoyaltyRule(token: string) {
  return apiFetch<LoyaltyRuleResponse>("/loyalty/rule", { token });
}

export function saveLoyaltyRule(
  token: string,
  body: {
    tokenThreshold: number;
    discountPercent: number;
    isActive: boolean;
  }
) {
  return apiFetch<{ rule: LoyaltyRule }>("/loyalty/rule", {
    method: "PUT",
    body,
    token,
  });
}

export function fetchLoyaltyBalances(token: string) {
  return apiFetch<LoyaltyBalancesResponse>("/loyalty/balances", { token });
}

export type StallResponse = { stall: Stall | null };
export type StallsResponse = { stalls: Stall[] };

export function fetchMyStall(token: string) {
  return apiFetch<StallResponse>("/stalls/me", { token });
}

export function saveMyStall(
  token: string,
  body: {
    name: string;
    location: string;
    license?: string;
    contact?: string;
  }
) {
  return apiFetch<{ stall: Stall }>("/stalls/me", {
    method: "PUT",
    body,
    token,
  });
}

export function fetchStalls(token: string) {
  return apiFetch<StallsResponse>("/stalls", { token });
}

export function createStall(
  token: string,
  body: {
    traderId: string;
    name: string;
    location: string;
    license?: string;
    contact?: string;
  }
) {
  return apiFetch<{ stall: Stall }>("/stalls", {
    method: "POST",
    body,
    token,
  });
}

export function updateStall(
  token: string,
  id: string,
  body: Partial<{
    name: string;
    location: string;
    license: string;
    contact: string;
    status: Stall["status"];
  }>
) {
  return apiFetch<{ stall: Stall }>(`/stalls/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}

export function fetchPublishedAnnouncements() {
  return apiFetch<{ announcements: Announcement[] }>("/announcements");
}

export function fetchAnnouncements(token: string) {
  return apiFetch<{ announcements: Announcement[] }>("/admin/announcements", {
    token,
  });
}

export function createAnnouncement(
  token: string,
  body: { title: string; body: string }
) {
  return apiFetch<{ announcement: Announcement }>("/admin/announcements", {
    method: "POST",
    body,
    token,
  });
}

export function updateAnnouncement(
  token: string,
  id: string,
  body: Partial<{ title: string; body: string; status: "Published" }>
) {
  return apiFetch<{ announcement: Announcement }>(`/admin/announcements/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}

export function deleteAnnouncement(token: string, id: string) {
  return apiFetch<{ ok: boolean }>(`/admin/announcements/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchReports(token: string) {
  return apiFetch<SalesReport>("/reports", { token });
}

export function fetchLogs(token: string, query?: { type?: string; user?: string }) {
  const params = new URLSearchParams();
  if (query?.type) params.set("type", query.type);
  if (query?.user) params.set("user", query.user);
  const qs = params.toString();
  return apiFetch<{ logs: SystemLog[] }>(`/logs${qs ? `?${qs}` : ""}`, { token });
}

export function fetchSettings(token?: string | null) {
  return apiFetch<{ settings: MarketSettings }>("/settings", {
    token: token ?? undefined,
  });
}

export function saveSettings(
  token: string,
  body: {
    vegetableCategories: string;
    opensAt: string;
    closesAt: string;
    marketName: string;
    offerTemplate: string;
  }
) {
  return apiFetch<{ settings: MarketSettings }>("/settings", {
    method: "PUT",
    body,
    token,
  });
}

export function sendContactMessage(body: {
  name: string;
  email: string;
  message: string;
}) {
  return apiFetch<{ message: ContactMessage }>("/contact", {
    method: "POST",
    body,
  });
}

export function fetchContactMessages(token: string) {
  return apiFetch<{ messages: ContactMessage[] }>("/contact", { token });
}

export function markContactRead(token: string, id: string) {
  return apiFetch<{ message: ContactMessage }>(`/contact/${id}`, {
    method: "PATCH",
    body: { read: true },
    token,
  });
}

export function deleteContactMessage(token: string, id: string) {
  return apiFetch<{ ok: boolean }>(`/contact/${id}`, {
    method: "DELETE",
    token,
  });
}
