import bcrypt from "bcryptjs";
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { PasswordReset } from "@/database/password-reset.model";
import { User } from "@/database/user.model";
import { writeSystemLog } from "@/lib/actions/log.actions";
import { getMarketSettings } from "@/lib/actions/settings.actions";
import { sendMail } from "@/lib/mail";

export class PasswordResetError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PasswordResetError";
    this.status = status;
  }
}

export const RESET_CODE_SENT_MESSAGE =
  "If that email is registered, a reset code was sent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const CODE_RE = /^\d{6}$/;

function normalizeEmail(value: unknown): string {
  return String(value ?? "").toLowerCase().trim();
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function codesMatch(storedHash: string, submitted: string): boolean {
  const submittedHash = hashCode(submitted);
  const stored = Buffer.from(storedHash, "hex");
  const incoming = Buffer.from(submittedHash, "hex");
  if (stored.length !== incoming.length) return false;
  return timingSafeEqual(stored, incoming);
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function marketName(): Promise<string> {
  try {
    const settings = await getMarketSettings();
    const name = settings.marketName?.trim();
    if (name) return name;
  } catch (err) {
    console.error("marketName for reset email error:", err);
  }
  return "Keppetipola Market";
}

async function sendResetCodeEmail(
  to: string,
  name: string,
  code: string
): Promise<void> {
  const market = await marketName();
  const subject = `${market} password reset code`;
  const greeting = name.trim() ? `Hi ${name.trim()},` : "Hi,";
  const text = `${greeting}

Your password reset code is ${code}.

This code expires in 10 minutes. If you did not request a reset, you can ignore this email.

${market}`;
  const html = `<p>${escapeHtml(greeting)}</p>
<p>Your password reset code is <strong style="font-size:1.25rem;letter-spacing:0.12em">${code}</strong>.</p>
<p>This code expires in 10 minutes. If you did not request a reset, you can ignore this email.</p>
<p>${escapeHtml(market)}</p>`;

  await sendMail({ to, subject, text, html, debugCode: code });
}

export async function requestPasswordReset(emailRaw: unknown): Promise<{
  message: string;
}> {
  const email = normalizeEmail(emailRaw);
  if (!email) {
    throw new PasswordResetError("Email is required");
  }
  if (!EMAIL_RE.test(email)) {
    throw new PasswordResetError("Enter a valid email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return { message: RESET_CODE_SENT_MESSAGE };
  }

  const existing = await PasswordReset.findOne({ email });
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { message: RESET_CODE_SENT_MESSAGE };
  }

  const code = generateCode();
  const now = new Date();
  await PasswordReset.findOneAndUpdate(
    { email },
    {
      email,
      codeHash: hashCode(code),
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
      attempts: 0,
      createdAt: now,
    },
    { upsert: true },
  );

  try {
    await sendResetCodeEmail(user.email, user.name, code);
  } catch (err) {
    console.error("sendResetCodeEmail error:", err);
    await PasswordReset.deleteOne({ email });
  }

  return { message: RESET_CODE_SENT_MESSAGE };
}

export async function resetPasswordWithCode(input: {
  email: unknown;
  code: unknown;
  newPassword: unknown;
}): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);
  const code = String(input.code ?? "").trim();
  const newPassword = String(input.newPassword ?? "");

  if (!email || !code || !newPassword) {
    throw new PasswordResetError(
      "Email, code, and new password are required"
    );
  }
  if (!EMAIL_RE.test(email)) {
    throw new PasswordResetError("Enter a valid email");
  }
  if (newPassword.length < 6) {
    throw new PasswordResetError("Password must be at least 6 characters");
  }
  if (!CODE_RE.test(code)) {
    throw new PasswordResetError("Invalid or expired reset code");
  }

  const record = await PasswordReset.findOne({ email });
  if (!record || record.expiresAt.getTime() <= Date.now()) {
    if (record) await record.deleteOne();
    throw new PasswordResetError("Invalid or expired reset code");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new PasswordResetError("Too many attempts. Request a new code");
  }

  if (!codesMatch(record.codeHash, code)) {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      await record.deleteOne();
      throw new PasswordResetError("Too many attempts. Request a new code");
    }
    await record.save();
    throw new PasswordResetError("Invalid or expired reset code");
  }

  const user = await User.findOne({ email });
  await record.deleteOne();
  if (!user) {
    throw new PasswordResetError("Invalid or expired reset code");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordChangedAt = new Date();
  await user.save();

  await writeSystemLog(
    "Login",
    `${user.name} reset their password`,
    user.email
  );

  return { message: "Password updated" };
}
