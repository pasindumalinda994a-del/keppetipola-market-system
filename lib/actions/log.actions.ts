import {
  SystemLog,
  type SystemLogType,
} from "@/database/system-log.model";
import type { SystemLog as SystemLogView } from "@/types";

function toView(doc: { toJSON: () => Record<string, unknown> }): SystemLogView {
  return doc.toJSON() as unknown as SystemLogView;
}

export async function writeSystemLog(
  type: SystemLogType,
  message: string,
  user?: string
): Promise<void> {
  try {
    await SystemLog.create({
      type,
      message,
      user: user?.trim().toLowerCase() || "",
    });
  } catch (err) {
    console.error("writeSystemLog error:", err);
  }
}

export async function listSystemLogs(options?: {
  type?: string;
  user?: string;
  limit?: number;
}) {
  const filter: Record<string, unknown> = {};
  if (options?.type) {
    filter.type = options.type;
  }
  if (options?.user) {
    filter.user = options.user.trim().toLowerCase();
  }
  const logs = await SystemLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(options?.limit ?? 200);
  return logs.map(toView);
}
