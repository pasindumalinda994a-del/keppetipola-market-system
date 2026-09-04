import { Announcement } from "@/database/announcement.model";
import { User } from "@/database/user.model";
import { createNotification } from "@/lib/actions/marketplace.actions";
import type { Announcement as AnnouncementView } from "@/types";

export class AnnouncementError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AnnouncementError";
    this.status = status;
  }
}

function toView(doc: { toJSON: () => Record<string, unknown> }): AnnouncementView {
  return doc.toJSON() as unknown as AnnouncementView;
}

function trimRequired(value: unknown, label: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AnnouncementError(`${label} is required`);
  }
  return text;
}

export async function listAnnouncements() {
  const items = await Announcement.find().sort({ createdAt: -1 });
  return items.map(toView);
}

export async function listPublishedAnnouncements(limit = 6) {
  const items = await Announcement.find({ status: "Published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit);
  return items.map(toView);
}

export async function createAnnouncement(input: { title: unknown; body: unknown }) {
  const announcement = await Announcement.create({
    title: trimRequired(input.title, "Title"),
    body: trimRequired(input.body, "Body"),
    status: "Draft",
  });
  return toView(announcement);
}

export async function updateAnnouncement(
  id: string,
  input: { title?: unknown; body?: unknown }
) {
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new AnnouncementError("Announcement not found", 404);
  }
  if (input.title !== undefined) {
    announcement.title = trimRequired(input.title, "Title");
  }
  if (input.body !== undefined) {
    announcement.body = trimRequired(input.body, "Body");
  }
  await announcement.save();
  return toView(announcement);
}

export async function publishAnnouncement(id: string) {
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new AnnouncementError("Announcement not found", 404);
  }

  const wasPublished = announcement.status === "Published";
  announcement.status = "Published";
  if (!announcement.publishedAt) {
    announcement.publishedAt = new Date();
  }
  await announcement.save();

  if (!wasPublished) {
    const recipients = await User.find({
      role: { $in: ["farmer", "trader"] },
      status: "Active",
    }).select("_id");
    await Promise.all(
      recipients.map((user) =>
        createNotification(
          user._id,
          "Announcements",
          announcement.title,
          announcement.body
        )
      )
    );
  }

  return toView(announcement);
}

export async function deleteAnnouncement(id: string) {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    throw new AnnouncementError("Announcement not found", 404);
  }
}
