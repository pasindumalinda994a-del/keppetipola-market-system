export type UserRole = "farmer" | "trader" | "admin";

export type Status =
  | "Pending"
  | "Offered"
  | "Accepted"
  | "Completed"
  | "Cancelled"
  | "Active"
  | "Closed"
  | "Published"
  | "Draft"
  | "Rejected";

export type AccountStatus = "Pending" | "Active" | "Inactive" | "Rejected";

export type QualityGrade = "A" | "B" | "C";

export interface Vegetable {
  id: string;
  name: string;
  category: string;
  unit: string;
  status: "Active" | "Inactive";
  bookmarked?: boolean;
}

export interface MarketPrice {
  vegetableId: string;
  vegetableName: string;
  category?: string;
  imageUrl: string;
  lowest: number;
  highest: number;
  average: number;
  change: number;
  lastUpdated: string;
}

export type PriceHistoryRange = "week" | "month" | "year";

export interface PriceHistoryPoint {
  date: string;
  average: number;
  lowest: number;
  highest: number;
}

export interface BuyingRequest {
  id: string;
  traderId: string;
  traderName: string;
  traderPhotoUrl?: string;
  vegetableId: string;
  vegetableName: string;
  quantityKg: number;
  remainingKg?: number;
  minPrice: number;
  maxPrice: number;
  preferredGrade: QualityGrade;
  pickupDate: string;
  closingTime: string;
  notes?: string;
  status: Status;
  rating?: number;
}

export interface Harvest {
  id: string;
  farmerId: string;
  farmerName?: string;
  farmerPhotoUrl?: string;
  vegetableId: string;
  vegetableName: string;
  quantityKg: number;
  remainingKg?: number;
  qualityGrade: QualityGrade;
  harvestDate: string;
  expectedDelivery: string;
  availableUntil: string;
  status: Status;
  applications: number;
  photos?: string[];
}

export interface Offer {
  id: string;
  source?: "harvest" | "application";
  harvestId?: string;
  applicationId?: string;
  requestId?: string;
  traderId: string;
  traderName: string;
  farmerId: string;
  farmerName?: string;
  vegetableName: string;
  price: number;
  quantityKg: number;
  delivery: string;
  rating: number;
  status: Status;
  message?: string;
}

export interface Sale {
  id: string;
  date: string;
  farmerId: string;
  traderId: string;
  traderName: string;
  farmerName: string;
  vegetableId?: string;
  vegetableName: string;
  quantityKg: number;
  unitPrice: number;
  total: number;
  delivery?: string;
  sourceOfferId?: string;
  harvestId?: string;
  requestId?: string;
  status: Status;
  originalUnitPrice?: number;
  loyaltyDiscountPercent?: number;
  loyaltyApplied?: boolean;
}

export interface Application {
  id: string;
  requestId: string;
  farmerId: string;
  farmerName: string;
  vegetableName: string;
  quantityKg: number;
  grade: QualityGrade;
  harvestDate: string;
  status: Status;
}

export interface PurchaseOrder {
  id: string;
  farmerId: string;
  farmerName: string;
  traderId: string;
  vegetableName: string;
  quantityKg: number;
  price: number;
  delivery: string;
  status: Status;
  date: string;
}

export type StallStatus = "Pending" | "Active" | "Inactive";

export interface Stall {
  id: string;
  traderId: string;
  traderName: string;
  name: string;
  location: string;
  license: string;
  contact: string;
  status: StallStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address: string;
  ruralServicesDivision?: string;
  identityFrontUrl?: string;
  identityBackUrl?: string;
  taxBillUrl?: string;
  photoUrl?: string;
  memberId?: string;
  status: AccountStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  joinedAt: string;
  notificationPrefs?: NotificationPrefs;
  bookmarkedVegetableIds?: string[];
}

export interface NotificationPrefs {
  offerAlerts: boolean;
  priceBookmarks: boolean;
  announcements: boolean;
  newApplications: boolean;
  acceptedOffers: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  status: "Published" | "Draft";
}

export interface NotificationItem {
  id: string;
  group: "Offers" | "Sales" | "Announcements" | "System" | "Applications" | "Accepted Offers";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  farmerName: string;
  traderName: string;
  vegetableName: string;
  quantityKg: number;
  amount: number;
  status: Status;
  date: string;
}

export interface SystemLog {
  id: string;
  type: "Login" | "Price Update" | "Transaction" | "Error";
  message: string;
  createdAt: string;
  user?: string;
}

export interface MarketSettings {
  id: string;
  vegetableCategories: string;
  opensAt: string;
  closesAt: string;
  marketName: string;
  offerTemplate?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ReportBucket {
  name: string;
  amount?: number;
  kg?: number;
  purchases?: number;
  weekday?: number;
}

export interface ReportExportRow {
  date: string;
  farmerName: string;
  traderName: string;
  vegetableName: string;
  quantityKg: number;
  unitPrice: number;
  total: number;
  status: string;
}

export interface SalesReport {
  daily: ReportBucket[];
  weekly: ReportBucket[];
  monthly: ReportBucket[];
  topVegetables: ReportBucket[];
  exportRows: ReportExportRow[];
}

export interface MarketStatCard {
  value: number;
  change: number;
  chartData: number[];
}

export interface MarketStats {
  todayTransactions: MarketStatCard;
  activeFarmers: MarketStatCard;
  activeTraders: MarketStatCard;
  vegetablesSoldTons: MarketStatCard;
}

/** Trader-defined loyalty program: N completed sales unlock a % offer. */
export interface LoyaltyRule {
  id: string;
  traderId: string;
  tokenThreshold: number;
  discountPercent: number;
  isActive: boolean;
  updatedAt: string;
}

/** Accumulated tokens for one farmer–trader pair. */
export interface LoyaltyBalance {
  id: string;
  farmerId: string;
  farmerName: string;
  traderId: string;
  traderName: string;
  tokenCount: number;
  /** Tokens counted toward the current threshold cycle. */
  tokensTowardReward: number;
  rewardUnlocked: boolean;
  lastEarnedAt?: string;
  /** Rule snapshot attached by the balances API. */
  tokenThreshold?: number;
  discountPercent?: number;
  isActive?: boolean;
}

/** Audit trail: one event per completed sale that issued a token. */
export interface LoyaltyTokenEvent {
  id: string;
  saleId: string;
  farmerId: string;
  traderId: string;
  tokensIssued: number;
  createdAt: string;
}

export interface LoyaltyProgress {
  current: number;
  threshold: number;
  percent: number;
  unlocked: boolean;
  discountPercent: number;
  ruleActive: boolean;
}
