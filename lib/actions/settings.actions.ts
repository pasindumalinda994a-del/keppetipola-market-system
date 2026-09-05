import {
  DEFAULT_OFFER_TEMPLATE,
  MarketSettings,
  type IMarketSettings,
} from "@/database/market-settings.model";
import { normalizeProduceCategoriesSetting } from "@/lib/produce";
import type { MarketSettings as MarketSettingsView } from "@/types";

export class SettingsError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "SettingsError";
    this.status = status;
  }
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function toView(doc: { toJSON: () => Record<string, unknown> }): MarketSettingsView {
  const view = doc.toJSON() as unknown as MarketSettingsView;
  view.vegetableCategories = normalizeProduceCategoriesSetting(
    view.vegetableCategories
  );
  return view;
}

function trimRequired(value: unknown, label: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new SettingsError(`${label} is required`);
  }
  return text;
}

export async function getMarketSettings() {
  let settings = await MarketSettings.findOne();
  if (!settings) {
    settings = await MarketSettings.create({});
  }
  return toView(settings);
}

export async function updateMarketSettings(input: Partial<IMarketSettings>) {
  const patch: Partial<IMarketSettings> = {};
  if (input.vegetableCategories !== undefined) {
    patch.vegetableCategories = normalizeProduceCategoriesSetting(
      String(input.vegetableCategories)
    );
  }
  if (input.opensAt !== undefined) {
    const opensAt = String(input.opensAt).trim();
    if (!TIME_RE.test(opensAt)) {
      throw new SettingsError("Opens time must be HH:MM");
    }
    patch.opensAt = opensAt;
  }
  if (input.closesAt !== undefined) {
    const closesAt = String(input.closesAt).trim();
    if (!TIME_RE.test(closesAt)) {
      throw new SettingsError("Closes time must be HH:MM");
    }
    patch.closesAt = closesAt;
  }
  if (input.marketName !== undefined) {
    patch.marketName = trimRequired(input.marketName, "Market name");
  }
  if (input.offerTemplate !== undefined) {
    patch.offerTemplate = String(input.offerTemplate).trim();
  }

  const settings = await MarketSettings.findOneAndUpdate(
    {},
    { $set: patch },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );
  return toView(settings!);
}

export function formatOfferMessage(
  template: string | undefined,
  vars: { trader: string; price: number; vegetable: string }
): string {
  const fallback = `${vars.trader} offered Rs.${vars.price}/kg for your ${vars.vegetable} listing.`;
  const text = (template || DEFAULT_OFFER_TEMPLATE).trim() || fallback;
  return text
    .replaceAll("{{trader}}", vars.trader)
    .replaceAll("{{price}}", String(vars.price))
    .replaceAll("{{vegetable}}", vars.vegetable);
}

export async function formatOfferNotification(vars: {
  trader: string;
  price: number;
  vegetable: string;
}): Promise<string> {
  const settings = await getMarketSettings();
  return formatOfferMessage(settings.offerTemplate, vars);
}
