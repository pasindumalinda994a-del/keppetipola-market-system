export function serializeId(
  value: Record<string, unknown>,
  options?: {
    objectIds?: string[];
    dates?: string[];
    dateOnly?: string[];
  }
): Record<string, unknown> {
  value.id = String(value._id);
  delete value._id;
  delete value.__v;

  for (const key of options?.objectIds ?? []) {
    if (value[key] != null) {
      value[key] = String(value[key]);
    }
  }

  for (const key of options?.dates ?? []) {
    const current = value[key];
    if (current instanceof Date) {
      value[key] = current.toISOString();
    }
  }

  for (const key of options?.dateOnly ?? []) {
    const current = value[key];
    if (current instanceof Date) {
      value[key] = current.toISOString().slice(0, 10);
    }
  }

  return value;
}

export function parsePositiveNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
