import type { MarketPrice, User, UserRole, Vegetable } from "@/types";

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

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<UserRole, "farmer" | "trader">;
};

export type UpdateProfilePayload = {
  name: string;
  phone: string;
  address: string;
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

export function updateUserStatus(
  token: string,
  id: string,
  status: "Active" | "Inactive"
) {
  return apiFetch<UserResponse>(`/users/${id}/status`, {
    method: "PATCH",
    body: { status },
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
