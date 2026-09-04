# Loyalty Token & Discount Reward

One **completed sale** between a farmer and a trader issues **1 loyalty token** for that pair. Each trader configures one loyalty rule (`tokenThreshold` and `discountPercent`). When cycle progress reaches the threshold and the rule is active, the farmer’s reward unlocks.

**Discount policy:** when `rewardUnlocked` is true, the **next accepted offer** between that pair is discounted by `discountPercent`. The cycle then resets (`tokensTowardReward = 0`, `rewardUnlocked = false`). Lifetime `tokenCount` never resets. Completing the discounted sale still issues 1 token toward the new cycle.

No predictive or ML logic — transactional counting + threshold check only.

## Collections

### `loyaltyrules`

| Field | Type | Notes |
|--------|------|--------|
| `traderId` | ObjectId | Unique per trader |
| `tokenThreshold` | int | e.g. 10 (min 1) |
| `discountPercent` | number | 0–100 |
| `isActive` | boolean | |
| `updatedAt` | date | |

### `loyaltybalances`

| Field | Type | Notes |
|--------|------|--------|
| `farmerId` | ObjectId | |
| `traderId` | ObjectId | Unique with `farmerId` |
| `farmerName` / `traderName` | string | Denormalized for lists |
| `tokenCount` | int | Lifetime tokens for this pair |
| `tokensTowardReward` | int | Progress in the current cycle |
| `rewardUnlocked` | boolean | |
| `lastEarnedAt` | date | |

### `loyaltytokenevents`

| Field | Type | Notes |
|--------|------|--------|
| `saleId` | ObjectId | **Unique** — idempotency key |
| `farmerId` / `traderId` | ObjectId | |
| `tokensIssued` | int | Always `1` for v1 |

## Flows

### Token issuance (`Sale` → `Completed`)

```
Sale status → Completed
  → if loyaltytokenevents already has saleId: stop (idempotent)
  → load loyalty rule for traderId (skip if missing or inactive)
  → insert loyaltytokenevents (saleId, tokensIssued = 1)
  → upsert loyaltybalances:
       tokenCount += 1
       tokensTowardReward = min(tokensTowardReward + 1, threshold)
       rewardUnlocked = tokensTowardReward >= tokenThreshold
       lastEarnedAt = now
```

Triggered from `completeSale` in `lib/actions/marketplace.actions.ts`.

### Discount on accept

```
Farmer accepts a pending offer
  → if rule is active AND rewardUnlocked for that pair:
       unitPrice = round(offer.price * (1 - discountPercent / 100))
       persist originalUnitPrice, loyaltyDiscountPercent, loyaltyApplied on the sale
       reset tokensTowardReward = 0, rewardUnlocked = false
  → else: sale uses the offer list price
```

## API

Auth: trader endpoints require trader role; farmer endpoints require farmer role. Data is scoped to the authenticated user.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/loyalty/rule` | Current trader’s rule, or defaults (`threshold` 10, `discountPercent` 5, `isActive` true) without inserting |
| `PUT` | `/api/loyalty/rule` | Upsert threshold, discount %, active; recomputes `rewardUnlocked` for that trader’s balances |
| `GET` | `/api/loyalty/balances` | Farmer: balances per trader + rule snapshot. Trader: enrolled farmers + `stats` |

### Example `PUT /api/loyalty/rule` body

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
  "traderId": "...",
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

Sales include `originalUnitPrice`, `loyaltyDiscountPercent`, and `loyaltyApplied` when a reward was redeemed on accept.

## Idempotency & edge cases

- Unique `saleId` on token events so retries do not double-issue tokens.
- Only `Completed` sales issue tokens — not `Accepted` / `Pending`.
- If the trader deactivates the rule, stop issuing new tokens and stop applying discounts; existing balances remain readable.
- Changing `tokenThreshold` recomputes `rewardUnlocked` immediately (`tokensTowardReward >= threshold` and rule active).

## Frontend

- UI: `/trader/loyalty`, `/farmer/loyalty`
- Progress helper: `lib/loyalty.ts` (`getLoyaltyProgress`)
- Types: `LoyaltyRule`, `LoyaltyBalance`, `LoyaltyTokenEvent`, `LoyaltyProgress` in `types/index.ts`
