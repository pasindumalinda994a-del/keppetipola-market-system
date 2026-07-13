import type { User, UserRole } from "@/types";

const mockUsers: Record<UserRole, User> = {
  farmer: {
    id: "farmer-1",
    name: "Sunil Bandara",
    email: "sunil@farm.lk",
    phone: "+94 71 234 5678",
    role: "farmer",
    address: "Nuwara Eliya Road, Keppetipola",
    status: "Active",
    joinedAt: "2025-03-12T08:00:00Z",
  },
  trader: {
    id: "trader-1",
    name: "Kamal Perera",
    email: "kamal@stall.lk",
    phone: "+94 77 889 1122",
    role: "trader",
    address: "Stall 12, Keppetipola Wholesale Market",
    status: "Active",
    joinedAt: "2024-11-02T08:00:00Z",
  },
  admin: {
    id: "admin-1",
    name: "Market Admin",
    email: "admin@keppetipola.lk",
    phone: "+94 55 222 3344",
    role: "admin",
    address: "Market Management Office",
    status: "Active",
    joinedAt: "2024-01-01T08:00:00Z",
  },
};

export function getMockUser(role: UserRole = "farmer"): User {
  return mockUsers[role];
}

export function portalPathForRole(role: UserRole): string {
  if (role === "farmer") return "/farmer";
  if (role === "trader") return "/trader";
  return "/admin";
}
