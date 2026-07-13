import type {
  Announcement,
  Application,
  BuyingRequest,
  Harvest,
  MarketPrice,
  MarketStats,
  NotificationItem,
  Offer,
  PriceHistoryPoint,
  PurchaseOrder,
  Sale,
  Stall,
  SystemLog,
  Transaction,
  User,
  Vegetable,
} from "@/types";

export const vegetables: Vegetable[] = [
  { id: "veg-1", name: "Carrot", category: "Root", unit: "kg", status: "Active", bookmarked: true },
  { id: "veg-2", name: "Cabbage", category: "Leafy", unit: "kg", status: "Active" },
  { id: "veg-3", name: "Leeks", category: "Leafy", unit: "kg", status: "Active", bookmarked: true },
  { id: "veg-4", name: "Beans", category: "Pod", unit: "kg", status: "Active" },
  { id: "veg-5", name: "Tomato", category: "Fruit", unit: "kg", status: "Active" },
  { id: "veg-6", name: "Potato", category: "Root", unit: "kg", status: "Active" },
  { id: "veg-7", name: "Beetroot", category: "Root", unit: "kg", status: "Active" },
  { id: "veg-8", name: "Capsicum", category: "Fruit", unit: "kg", status: "Active" },
];

export const marketPrices: MarketPrice[] = [
  { vegetableId: "veg-1", vegetableName: "Carrot", imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=640&h=480&fit=crop&q=80", lowest: 190, highest: 200, average: 196, change: 5, lastUpdated: new Date(Date.now() - 3 * 60000).toISOString() },
  { vegetableId: "veg-2", vegetableName: "Cabbage", imageUrl: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=640&h=480&fit=crop&q=80", lowest: 80, highest: 95, average: 88, change: -2, lastUpdated: new Date(Date.now() - 8 * 60000).toISOString() },
  { vegetableId: "veg-3", vegetableName: "Leeks", imageUrl: "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=640&h=480&fit=crop&q=80", lowest: 220, highest: 245, average: 232, change: 8, lastUpdated: new Date(Date.now() - 5 * 60000).toISOString() },
  { vegetableId: "veg-4", vegetableName: "Beans", imageUrl: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=640&h=480&fit=crop&q=80", lowest: 280, highest: 310, average: 295, change: 12, lastUpdated: new Date(Date.now() - 12 * 60000).toISOString() },
  { vegetableId: "veg-5", vegetableName: "Tomato", imageUrl: "https://images.unsplash.com/photo-1546470427-e26264be0d16?w=640&h=480&fit=crop&q=80", lowest: 150, highest: 175, average: 162, change: -4, lastUpdated: new Date(Date.now() - 6 * 60000).toISOString() },
  { vegetableId: "veg-6", vegetableName: "Potato", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=640&h=480&fit=crop&q=80", lowest: 120, highest: 135, average: 128, change: 1, lastUpdated: new Date(Date.now() - 15 * 60000).toISOString() },
  { vegetableId: "veg-7", vegetableName: "Beetroot", imageUrl: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f54?w=640&h=480&fit=crop&q=80", lowest: 160, highest: 180, average: 170, change: 3, lastUpdated: new Date(Date.now() - 9 * 60000).toISOString() },
  { vegetableId: "veg-8", vegetableName: "Capsicum", imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=640&h=480&fit=crop&q=80", lowest: 350, highest: 390, average: 370, change: -6, lastUpdated: new Date(Date.now() - 4 * 60000).toISOString() },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function getPriceHistory(vegetableId: string): PriceHistoryPoint[] {
  const base = marketPrices.find((p) => p.vegetableId === vegetableId)?.average ?? 150;
  return Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i;
    const wobble = Math.sin(i * 1.3) * 8 + (i % 3) * 2;
    const average = Math.round(base - 10 + wobble + offset);
    return {
      date: daysAgo(offset),
      average,
      lowest: average - 8,
      highest: average + 10,
    };
  });
}

export const buyingRequests: BuyingRequest[] = [
  { id: "req-1", traderId: "trader-1", traderName: "Trader ABC", vegetableId: "veg-1", vegetableName: "Carrot", quantityKg: 500, minPrice: 190, maxPrice: 198, preferredGrade: "A", pickupDate: "2026-07-14", closingTime: "2026-07-13T18:00:00Z", status: "Active", rating: 4.6 },
  { id: "req-2", traderId: "trader-2", traderName: "Green Valley Stall", vegetableId: "veg-3", vegetableName: "Leeks", quantityKg: 300, minPrice: 225, maxPrice: 240, preferredGrade: "A", pickupDate: "2026-07-15", closingTime: "2026-07-14T12:00:00Z", status: "Active", rating: 4.8 },
  { id: "req-3", traderId: "trader-3", traderName: "Hill Country Traders", vegetableId: "veg-4", vegetableName: "Beans", quantityKg: 200, minPrice: 285, maxPrice: 305, preferredGrade: "B", pickupDate: "2026-07-14", closingTime: "2026-07-13T20:00:00Z", status: "Active", rating: 4.2 },
  { id: "req-4", traderId: "trader-1", traderName: "Trader ABC", vegetableId: "veg-1", vegetableName: "Carrot", quantityKg: 800, minPrice: 195, maxPrice: 200, preferredGrade: "A", pickupDate: "2026-07-16", closingTime: "2026-07-15T10:00:00Z", status: "Active", rating: 4.6 },
  { id: "req-5", traderId: "trader-4", traderName: "Fresh Mart Stall", vegetableId: "veg-5", vegetableName: "Tomato", quantityKg: 450, minPrice: 155, maxPrice: 168, preferredGrade: "A", pickupDate: "2026-07-14", closingTime: "2026-07-13T16:00:00Z", status: "Active", rating: 4.4 },
  { id: "req-6", traderId: "trader-2", traderName: "Green Valley Stall", vegetableId: "veg-2", vegetableName: "Cabbage", quantityKg: 700, minPrice: 82, maxPrice: 92, preferredGrade: "B", pickupDate: "2026-07-15", closingTime: "2026-07-14T09:00:00Z", status: "Active", rating: 4.8 },
];

export const harvests: Harvest[] = [
  { id: "har-1", farmerId: "farmer-1", vegetableId: "veg-1", vegetableName: "Carrot", quantityKg: 420, qualityGrade: "A", harvestDate: "2026-07-12", expectedDelivery: "2026-07-14", availableUntil: "2026-07-16", status: "Active", applications: 5 },
  { id: "har-2", farmerId: "farmer-1", vegetableId: "veg-3", vegetableName: "Leeks", quantityKg: 180, qualityGrade: "A", harvestDate: "2026-07-11", expectedDelivery: "2026-07-13", availableUntil: "2026-07-15", status: "Active", applications: 3 },
  { id: "har-3", farmerId: "farmer-1", vegetableId: "veg-4", vegetableName: "Beans", quantityKg: 95, qualityGrade: "B", harvestDate: "2026-07-10", expectedDelivery: "2026-07-12", availableUntil: "2026-07-14", status: "Pending", applications: 1 },
  { id: "har-4", farmerId: "farmer-1", vegetableId: "veg-6", vegetableName: "Potato", quantityKg: 600, qualityGrade: "A", harvestDate: "2026-07-08", expectedDelivery: "2026-07-10", availableUntil: "2026-07-12", status: "Completed", applications: 8 },
];

export const offers: Offer[] = [
  { id: "off-1", harvestId: "har-1", traderId: "trader-1", traderName: "Trader ABC", farmerId: "farmer-1", vegetableName: "Carrot", price: 201, quantityKg: 400, delivery: "2026-07-14", rating: 4.6, status: "Pending", message: "Need Grade A only" },
  { id: "off-2", harvestId: "har-1", traderId: "trader-2", traderName: "Green Valley Stall", farmerId: "farmer-1", vegetableName: "Carrot", price: 198, quantityKg: 420, delivery: "2026-07-14", rating: 4.8, status: "Pending" },
  { id: "off-3", harvestId: "har-2", traderId: "trader-3", traderName: "Hill Country Traders", farmerId: "farmer-1", vegetableName: "Leeks", price: 238, quantityKg: 150, delivery: "2026-07-13", rating: 4.2, status: "Offered" },
  { id: "off-4", harvestId: "har-1", traderId: "trader-4", traderName: "Fresh Mart Stall", farmerId: "farmer-1", vegetableName: "Carrot", price: 195, quantityKg: 300, delivery: "2026-07-15", rating: 4.4, status: "Pending" },
  { id: "off-5", harvestId: "har-2", traderId: "trader-1", traderName: "Trader ABC", farmerId: "farmer-1", vegetableName: "Leeks", price: 242, quantityKg: 180, delivery: "2026-07-13", rating: 4.6, status: "Accepted" },
];

export const sales: Sale[] = [
  { id: "sale-1", date: "2026-07-10", farmerId: "farmer-1", traderId: "trader-1", traderName: "Trader ABC", farmerName: "Sunil Bandara", vegetableName: "Potato", quantityKg: 500, unitPrice: 128, total: 64000, status: "Completed" },
  { id: "sale-2", date: "2026-07-08", farmerId: "farmer-1", traderId: "trader-2", traderName: "Green Valley Stall", farmerName: "Sunil Bandara", vegetableName: "Carrot", quantityKg: 350, unitPrice: 192, total: 67200, status: "Completed" },
  { id: "sale-3", date: "2026-07-05", farmerId: "farmer-1", traderId: "trader-3", traderName: "Hill Country Traders", farmerName: "Sunil Bandara", vegetableName: "Beans", quantityKg: 120, unitPrice: 290, total: 34800, status: "Completed" },
  { id: "sale-4", date: "2026-07-12", farmerId: "farmer-1", traderId: "trader-1", traderName: "Trader ABC", farmerName: "Sunil Bandara", vegetableName: "Leeks", quantityKg: 80, unitPrice: 235, total: 18800, status: "Accepted" },
];

export const applications: Application[] = [
  { id: "app-1", requestId: "req-1", farmerId: "farmer-1", farmerName: "Sunil Bandara", vegetableName: "Carrot", quantityKg: 400, grade: "A", harvestDate: "2026-07-12", status: "Pending" },
  { id: "app-2", requestId: "req-1", farmerId: "farmer-2", farmerName: "Nimal Silva", vegetableName: "Carrot", quantityKg: 250, grade: "A", harvestDate: "2026-07-11", status: "Pending" },
  { id: "app-3", requestId: "req-2", farmerId: "farmer-3", farmerName: "Kumari Jayasuriya", vegetableName: "Leeks", quantityKg: 200, grade: "A", harvestDate: "2026-07-12", status: "Offered" },
  { id: "app-4", requestId: "req-3", farmerId: "farmer-1", farmerName: "Sunil Bandara", vegetableName: "Beans", quantityKg: 95, grade: "B", harvestDate: "2026-07-10", status: "Pending" },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po-1", farmerId: "farmer-1", farmerName: "Sunil Bandara", traderId: "trader-1", vegetableName: "Carrot", quantityKg: 400, price: 198, delivery: "2026-07-14", status: "Accepted", date: "2026-07-13" },
  { id: "po-2", farmerId: "farmer-2", farmerName: "Nimal Silva", traderId: "trader-1", vegetableName: "Potato", quantityKg: 300, price: 130, delivery: "2026-07-15", status: "Pending", date: "2026-07-12" },
  { id: "po-3", farmerId: "farmer-3", farmerName: "Kumari Jayasuriya", traderId: "trader-1", vegetableName: "Leeks", quantityKg: 150, price: 235, delivery: "2026-07-13", status: "Completed", date: "2026-07-10" },
];

export const stalls: Stall[] = [
  { id: "stall-1", traderId: "trader-1", traderName: "Kamal Perera", name: "Trader ABC", location: "Block A, Stall 12", license: "KM-2024-0112", contact: "+94 77 889 1122", status: "Active" },
  { id: "stall-2", traderId: "trader-2", traderName: "Ravi Fernando", name: "Green Valley Stall", location: "Block B, Stall 04", license: "KM-2024-0088", contact: "+94 71 445 6677", status: "Active" },
  { id: "stall-3", traderId: "trader-3", traderName: "Saman Wick", name: "Hill Country Traders", location: "Block A, Stall 21", license: "KM-2023-0155", contact: "+94 76 112 3344", status: "Pending" },
  { id: "stall-4", traderId: "trader-4", traderName: "Dilani Perera", name: "Fresh Mart Stall", location: "Block C, Stall 07", license: "KM-2025-0021", contact: "+94 75 998 2211", status: "Active" },
];

export const users: User[] = [
  { id: "farmer-1", name: "Sunil Bandara", email: "sunil@farm.lk", phone: "+94 71 234 5678", role: "farmer", address: "Nuwara Eliya Road, Keppetipola", status: "Active", joinedAt: "2025-03-12T08:00:00Z" },
  { id: "farmer-2", name: "Nimal Silva", email: "nimal@farm.lk", phone: "+94 71 555 1212", role: "farmer", address: "Ambewela", status: "Active", joinedAt: "2025-05-01T08:00:00Z" },
  { id: "farmer-3", name: "Kumari Jayasuriya", email: "kumari@farm.lk", phone: "+94 72 333 4499", role: "farmer", address: "Welimada", status: "Pending", joinedAt: "2026-07-01T08:00:00Z" },
  { id: "trader-1", name: "Kamal Perera", email: "kamal@stall.lk", phone: "+94 77 889 1122", role: "trader", address: "Stall 12", status: "Active", joinedAt: "2024-11-02T08:00:00Z" },
  { id: "trader-2", name: "Ravi Fernando", email: "ravi@stall.lk", phone: "+94 71 445 6677", role: "trader", address: "Stall 04", status: "Active", joinedAt: "2024-12-15T08:00:00Z" },
  { id: "admin-1", name: "Market Admin", email: "admin@keppetipola.lk", phone: "+94 55 222 3344", role: "admin", address: "Office", status: "Active", joinedAt: "2024-01-01T08:00:00Z" },
];

export const announcements: Announcement[] = [
  { id: "ann-1", title: "Market opens at 4:00 AM tomorrow", body: "Early trading window for leafy vegetables. Arrive by 3:30 AM for unloading.", publishedAt: "2026-07-12T10:00:00Z", status: "Published" },
  { id: "ann-2", title: "Carrot demand high this week", body: "Traders report strong demand for Grade A carrots. Farmers with stock should list early.", publishedAt: "2026-07-11T14:30:00Z", status: "Published" },
  { id: "ann-3", title: "Weighbridge maintenance Sunday", body: "Lane 2 weighbridge closed 6–10 AM. Use Lane 1 or Lane 3.", publishedAt: "2026-07-10T09:00:00Z", status: "Published" },
];

export const notifications: NotificationItem[] = [
  { id: "n-1", group: "Offers", title: "New offer on Carrot", message: "Trader ABC offered Rs.201/kg for 400kg.", createdAt: new Date(Date.now() - 20 * 60000).toISOString(), read: false },
  { id: "n-2", group: "Offers", title: "Offer from Green Valley", message: "Rs.198/kg for your full carrot stock.", createdAt: new Date(Date.now() - 55 * 60000).toISOString(), read: false },
  { id: "n-3", group: "Sales", title: "Sale completed", message: "Potato sale to Trader ABC marked completed.", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), read: true },
  { id: "n-4", group: "Announcements", title: "Market hours update", message: "Opens at 4:00 AM tomorrow.", createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), read: true },
  { id: "n-5", group: "System", title: "Profile reminder", message: "Add bank details when available for faster payouts.", createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), read: true },
  { id: "n-6", group: "Applications", title: "New application", message: "Sunil Bandara applied to your Carrot request.", createdAt: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
  { id: "n-7", group: "Accepted Offers", title: "Offer accepted", message: "Your leek offer was accepted by Kumari.", createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), read: false },
];

export const transactions: Transaction[] = [
  { id: "txn-1001", farmerName: "Sunil Bandara", traderName: "Trader ABC", vegetableName: "Potato", quantityKg: 500, amount: 64000, status: "Completed", date: "2026-07-10" },
  { id: "txn-1002", farmerName: "Nimal Silva", traderName: "Green Valley Stall", vegetableName: "Carrot", quantityKg: 280, amount: 53760, status: "Completed", date: "2026-07-11" },
  { id: "txn-1003", farmerName: "Kumari Jayasuriya", traderName: "Hill Country Traders", vegetableName: "Leeks", quantityKg: 150, amount: 35250, status: "Accepted", date: "2026-07-12" },
  { id: "txn-1004", farmerName: "Sunil Bandara", traderName: "Fresh Mart Stall", vegetableName: "Beans", quantityKg: 90, amount: 26100, status: "Pending", date: "2026-07-13" },
];

export const systemLogs: SystemLog[] = [
  { id: "log-1", type: "Login", message: "Farmer Sunil Bandara signed in", createdAt: new Date(Date.now() - 15 * 60000).toISOString(), user: "sunil@farm.lk" },
  { id: "log-2", type: "Price Update", message: "Carrot average updated to Rs.196", createdAt: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: "log-3", type: "Transaction", message: "txn-1004 created (Beans)", createdAt: new Date(Date.now() - 40 * 60000).toISOString() },
  { id: "log-4", type: "Error", message: "Failed to sync weighbridge Lane 2", createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: "log-5", type: "Login", message: "Trader Kamal Perera signed in", createdAt: new Date(Date.now() - 120 * 60000).toISOString(), user: "kamal@stall.lk" },
];

export const marketStats: MarketStats = {
  todayTransactions: 234,
  activeFarmers: 142,
  activeTraders: 39,
  vegetablesSoldTons: 12.4,
};

export const farmerDashboardStats = {
  harvestListings: 8,
  pendingOffers: 5,
  acceptedSales: 12,
  totalEarnings: 185000,
};

export const traderDashboardStats = {
  buyingRequests: 6,
  applications: 14,
  purchasesToday: 3,
  todaySpending: 128400,
};

export const adminDashboardStats = {
  farmers: 142,
  traders: 39,
  transactions: 234,
  todaySales: 2860000,
};

export const monthlySpending = [
  { month: "Feb", amount: 420000 },
  { month: "Mar", amount: 510000 },
  { month: "Apr", amount: 480000 },
  { month: "May", amount: 620000 },
  { month: "Jun", amount: 590000 },
  { month: "Jul", amount: 340000 },
];

export const topVegetablesPurchased = [
  { name: "Carrot", kg: 4200 },
  { name: "Leeks", kg: 3100 },
  { name: "Potato", kg: 2800 },
  { name: "Beans", kg: 1900 },
  { name: "Tomato", kg: 1600 },
];
