import { NextResponse } from "next/server";
import { isAuthError, requireActiveRole } from "@/lib/actions/auth.actions";
import {
  listBalancesForFarmer,
  listBalancesForTrader,
} from "@/lib/actions/loyalty.actions";
import { getLoyaltyProgress } from "@/lib/loyalty";

export async function GET(request: Request) {
  try {
    const auth = await requireActiveRole(request, ["farmer", "trader"]);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const userId = String(auth.user._id);
    const balances =
      auth.user.role === "trader"
        ? await listBalancesForTrader(userId)
        : await listBalancesForFarmer(userId);

    const enrolled = balances.length;
    const rewardsReady = balances.filter((b) =>
      getLoyaltyProgress(b).unlocked
    ).length;
    const avgTokens =
      enrolled === 0
        ? 0
        : Math.round(
            balances.reduce((sum, b) => sum + b.tokenCount, 0) / enrolled
          );

    return NextResponse.json({
      balances,
      stats: { enrolled, rewardsReady, avgTokens },
    });
  } catch (err) {
    console.error("listLoyaltyBalances error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
