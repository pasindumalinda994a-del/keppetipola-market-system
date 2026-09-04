import { ContactMessage } from "@/database/contact-message.model";
import type { ContactMessage as ContactMessageView } from "@/types";

export class ContactError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ContactError";
    this.status = status;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toView(doc: { toJSON: () => Record<string, unknown> }): ContactMessageView {
  return doc.toJSON() as unknown as ContactMessageView;
}

function trimRequired(value: unknown, label: string, max = 200): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new ContactError(`${label} is required`);
  }
  if (text.length > max) {
    throw new ContactError(`${label} is too long`);
  }
  return text;
}

export async function createContactMessage(input: {
  name: unknown;
  email: unknown;
  message: unknown;
}) {
  const name = trimRequired(input.name, "Name", 120);
  const email = trimRequired(input.email, "Email", 200).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new ContactError("Enter a valid email");
  }
  const message = trimRequired(input.message, "Message", 5000);
  const created = await ContactMessage.create({ name, email, message });
  return toView(created);
}

export async function listContactMessages() {
  const items = await ContactMessage.find().sort({ createdAt: -1 });
  return items.map(toView);
}

export async function markContactMessageRead(id: string) {
  const item = await ContactMessage.findById(id);
  if (!item) {
    throw new ContactError("Message not found", 404);
  }
  item.read = true;
  await item.save();
  return toView(item);
}

export async function deleteContactMessage(id: string) {
  const item = await ContactMessage.findByIdAndDelete(id);
  if (!item) {
    throw new ContactError("Message not found", 404);
  }
}
