export function profilePhotoSrc(
  userId: string | undefined,
  photoUrl?: string
): string | undefined {
  if (!userId || !photoUrl) return undefined;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  return `${base}/api/users/${userId}/photo?v=${encodeURIComponent(photoUrl)}`;
}

export function withTraderPhoto<T extends object>(
  request: T,
  photoUrl?: string
): T & { traderPhotoUrl?: string } {
  const traderId = "traderId" in request ? String(request.traderId ?? "") : "";
  const traderPhotoUrl = profilePhotoSrc(traderId, photoUrl);
  if (!traderPhotoUrl) return request;
  return { ...request, traderPhotoUrl };
}

export function withFarmerPhoto<T extends object>(
  harvest: T,
  photoUrl?: string
): T & { farmerPhotoUrl?: string } {
  const farmerId = "farmerId" in harvest ? String(harvest.farmerId ?? "") : "";
  const farmerPhotoUrl = profilePhotoSrc(farmerId, photoUrl);
  if (!farmerPhotoUrl) return harvest;
  return { ...harvest, farmerPhotoUrl };
}
