import { NextResponse } from "next/server";
import {
  isAuthError,
  requireActiveRole,
} from "@/lib/actions/auth.actions";
import {
  acceptOffer,
  MarketplaceError,
  rejectOffer,
} from "@/lib/actions/marketplace.actions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "farmer");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();
    const action = String(body.action || body.status || "").toLowerCase();

    if (action === "accept" || action === "accepted") {
      const sale = await acceptOffer(id, auth.user);
      return NextResponse.json({ sale: sale.toJSON() });
    }
    if (action === "reject" || action === "cancelled") {
      const offer = await rejectOffer(id, auth.user);
      return NextResponse.json({ offer: offer.toJSON() });
    }

    return NextResponse.json(
      { message: "Action must be accept or reject" },
      { status: 400 }
    );
  } catch (err) {
    if (err instanceof MarketplaceError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateOffer error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
