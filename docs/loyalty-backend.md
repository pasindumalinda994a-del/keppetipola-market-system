# Loyalty Token & Discount Reward — Backend Guide

Frontend for this feature is mock-driven. Use this doc when wiring persistence and APIs.

## Rule summary

- One **completed sale** between a farmer and a trader issues **1 loyalty token** for that pair.
- Each trader configures one loyalty rule: `tokenThreshold` and `discountPercent` (percentage only).
- When `tokenCount >= tokenThreshold` and the rule is active, `rewardUnlocked` becomes true.
- No predictive or ML logic — transactional counting + threshold check only.

## Suggested tables

### `loyalty_rules`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid / text PK | |
| `trader_id` | FK → users | Unique per trader (one active rule) |
| `token_threshold` | int | e.g. 10 |
| `discount_percent` | numeric | e.g. 5.00 |
| `is_active` | boolean | |
| `updated_at` | timestamptz | |

### `loyalty_balances`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid / text PK | |
| `farmer_id` | FK → users | |
| `trader_id` | FK → users | |
| `token_count` | int | Lifetime tokens for this pair |
| `tokens_toward_reward` | int | Progress in current cycle |
| `reward_unlocked` | boolean | |
| `last_earned_at` | date / timestamptz | |
| Unique | `(farmer_id, trader_id)` | |

### `loyalty_token_events`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid / text PK | |
| `sale_id` | FK → sales | **Unique** — idempotency key |
| `farmer_id` | FK | |
| `trader_id` | FK | |
| `tokens_issued` | int | Always `1` for v1 |
| `created_at` | timestamptz | |

## Issuance flow

```
Sale status → Completed
  → if loyalty_token_events already has sale_id: stop (idempotent)
  → load loyalty_rules for trader_id (skip if missing or inactive)
  → insert loyalty_token_events (sale_id, tokens_issued = 1)
  → upsert loyalty_balances:
       token_count += 1
       tokens_toward_reward = min(token_count, threshold)  // or reset after redeem
       reward_unlocked = token_count >= token_threshold
       last_earned_at = now
```

Trigger this from the same transaction/service that marks a sale `Completed` (or via an outbox/event listener on sale completion).

## API sketch

Auth: trader endpoints require trader role; farmer endpoints require farmer role. Scope data to the authenticated user.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/trader/loyalty/rule` | Current trader’s rule (or defaults) |
| `PUT` | `/api/trader/loyalty/rule` | Upsert threshold, discount %, active |
| `GET` | `/api/trader/loyalty/balances` | Farmers enrolled with this trader |
| `GET` | `/api/farmer/loyalty/balances` | Farmer’s balances per trader (include rule snapshot: threshold, discount %) |

### Example `PUT /api/trader/loyalty/rule` body

```json
{
  "tokenThreshold": 10,
  "discountPercent": 5,
  "isActive": true
}
```

### Example farmer balance item

```json
{
  "traderId": "trader-1",
  "traderName": "Trader ABC",
  "tokenCount": 8,
  "tokensTowardReward": 8,
  "rewardUnlocked": false,
  "tokenThreshold": 10,
  "discountPercent": 5,
  "isActive": true,
  "lastEarnedAt": "2026-07-10"
}
```

## Applying the discount (product decision)

The current frontend only **shows** unlock state; it does not auto-adjust sale totals.

When implementing checkout/offers, pick one and document it in the API:

1. **Next deal** — when `rewardUnlocked`, apply `discountPercent` once on the next accepted offer or completed sale, then clear/reset unlock for the next cycle; or  
2. **At offer acceptance** — trader/farmer sees discounted unit price before confirming.

Until then, keep `rewardUnlocked` as a flag the UI can surface.

## Idempotency & edge cases

- Enforce **unique `sale_id`** on `loyalty_token_events` so retries do not double-issue tokens.
- Only `Completed` sales issue tokens — not `Accepted` / `Pending`.
- If the trader deactivates the rule, stop issuing new tokens; existing balances remain readable.
- Changing `tokenThreshold` downward may unlock farmers immediately on next read — recompute `reward_unlocked` when the rule is updated, or on next issuance.

## Frontend mapping

Mock types and helpers live in:

- `types/index.ts` — `LoyaltyRule`, `LoyaltyBalance`, `LoyaltyTokenEvent`, `LoyaltyProgress`
- `lib/mock/index.ts` — seed data + `getLoyaltyProgress` / `getLoyaltyRuleForTrader`
- UI: `/trader/loyalty`, `/farmer/loyalty`
