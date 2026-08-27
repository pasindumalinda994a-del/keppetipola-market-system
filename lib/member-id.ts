import { Counter } from "@/database/counter.model";

export type MemberRole = "farmer" | "trader";

export function formatMemberId(role: MemberRole, seq: number): string {
  const prefix = role === "farmer" ? "FRM" : "TRD";
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

export async function nextMemberId(role: MemberRole): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { key: role },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  if (!counter) {
    throw new Error("Could not allocate member ID");
  }
  return formatMemberId(role, counter.seq);
}

export function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === 11000
  );
}
