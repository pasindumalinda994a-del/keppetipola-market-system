import { NextResponse } from "next/server";
import {
  isAuthError,
  requireActiveRole,
} from "@/lib/actions/auth.actions";
import {
  closeBuyingRequestListing,
  MarketplaceError,
} from "@/lib/actions/marketplace.actions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();
    if (body.status !== "Closed" && body.status !== "Cancelled") {
      return NextResponse.json(
        { message: "Status must be Closed or Cancelled" },
        { status: 400 }
      );
    }

    const buyingRequest = await closeBuyingRequestListing(
      id,
      String(auth.user._id),
      body.status
    );
    return NextResponse.json({ request: buyingRequest.toJSON() });
  } catch (err) {
    if (err instanceof MarketplaceError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateRequest error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
