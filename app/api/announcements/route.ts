import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { listPublishedAnnouncements } from "@/lib/actions/announcement.actions";

export async function GET() {
  try {
    await connectDB();
    const announcements = await listPublishedAnnouncements();
    return NextResponse.json({ announcements });
  } catch (err) {
    console.error("listPublishedAnnouncements error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
