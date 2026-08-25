import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/database/user.model";
import {
  assertValidUpload,
  removeRegistrationFiles,
  saveRegistrationFile,
  UploadError,
} from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await connectDB();

    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const password = String(form.get("password") || "");
    const role = String(form.get("role") || "").trim();
    const address = String(form.get("address") || "").trim();
    const ruralServicesDivision = String(
      form.get("ruralServicesDivision") || ""
    ).trim();

    if (!name || !email || !phone || !password || !role || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (role !== "farmer" && role !== "trader") {
      return NextResponse.json(
        { message: "Role must be farmer or trader" },
        { status: 400 }
      );
    }

    if (role === "farmer" && !ruralServicesDivision) {
      return NextResponse.json(
        { message: "Rural Services Division is required for farmers" },
        { status: 400 }
      );
    }

    let identityFront: File;
    let identityBack: File;
    let taxBill: File;
    try {
      identityFront = assertValidUpload(
        form.get("identityFront"),
        "Identity photo (front)"
      );
      identityBack = assertValidUpload(
        form.get("identityBack"),
        "Identity photo (back)"
      );
      taxBill = assertValidUpload(form.get("taxBill"), "Tax bill photo");
    } catch (err) {
      const message =
        err instanceof UploadError ? err.message : "Invalid document upload";
      return NextResponse.json({ message }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role,
      address,
      ruralServicesDivision: role === "farmer" ? ruralServicesDivision : "",
      status: "Pending",
    });

    try {
      const userId = user._id.toString();
      const [identityFrontUrl, identityBackUrl, taxBillUrl] = await Promise.all([
        saveRegistrationFile(userId, "identityFront", identityFront),
        saveRegistrationFile(userId, "identityBack", identityBack),
        saveRegistrationFile(userId, "taxBill", taxBill),
      ]);

      user.identityFrontUrl = identityFrontUrl;
      user.identityBackUrl = identityBackUrl;
      user.taxBillUrl = taxBillUrl;
      await user.save();
    } catch (err) {
      await removeRegistrationFiles(user._id.toString());
      await User.findByIdAndDelete(user._id);
      throw err;
    }

    return NextResponse.json(
      {
        user: user.toJSON(),
        message:
          "Application submitted. You can log in after an admin approves your account.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("register error:", err);
    if (err instanceof UploadError) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
