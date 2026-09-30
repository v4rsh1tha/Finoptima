# Finoptima Recommendation Engine

**Target reader:** A developer joining the project who needs to understand the engine in 30 minutes.

---

## 1. Overview

The Finoptima engine takes a user's financial profile (income, credit score, bank accounts, fee tolerance) and monthly spending breakdown across up to 15 categories, then ranks every credit card in the database against that profile to return the top 5 matches. It works in five scoring layers: it first figures out what the user is trying to accomplish (travel rewards, cashback, premium perks, etc.), then measures how well each card fits that goal, whether the user can actually get approved, how much rupee value the card would generate for their specific spending mix, and finally adjusts for competitive positioning. The result is an ordered list with estimated annual rewards, fee waiver status, benefit flags, and plain-English reasons why each card was recommended.

**Input:** JSON with `profile` (13 fields) and `spend` (15 spend category fields in rupees/month).  
**Output:** JSON with top 5 ranked cards, scores, rupee breakdown, benefit flags, and reasons.

---

## 2. Architecture

```
POST /api/recommend
        │
        ▼
┌───────────────────────────────────────────┐
│  app.py — Flask route: recommend()        │
│  Splits request into profile + spend dicts│
└──────────────┬────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────┐
│  engine/scorer.py — rank_cards()          │
│                                           │
│  1. get_total_spend_midpoint()            │  maps range string → rupees
│  2. detect_intent()  [intent.py]          │  Layer 1: intent detection
│  3. load_and_sanitize_cards() [sanitizer] │  loads + validates cards_data.json
│                                           │
│  For each card:                           │
│  4. calculate_annual_rupee_value()        │  Layer 4: rupee value calc
│  5. score_intent_layer()                  │  Layer 1: intent match score
│  6. score_eligibility_layer()             │  Layer 3: eligibility check
│  7. score_fit_layer()                     │  Layer 2: fit scoring
│                                           │
│  8. Normalize rupee_value_score (0-100)   │  relative across all cards
│  9. First-pass sort by weighted formula   │
│  10. score_competitive_layer()            │  Layer 5: competitive adj.
│  11. Final sort with competitive scores   │
│  12. Return top 5                         │
└──────────────┬────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────┐
│  engine/explainer.py — generate_reasons() │
│  Produces 3-4 plain-English bullet points │
│  per card from rupee breakdown + scores   │
└──────────────┬────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────┐
│  app.py — builds response JSON            │
│  Derives benefit_flags, effective_fee,    │
│  fee_waived from card data + spend        │
└───────────────────────────────────────────┘
```

**Config files loaded at runtime:**
- `config/scoring_functions.json` — layer weights
- `config/intent_adjacency.json` — intent→card-type affinity matrix
- `config/fit_weights.json` — fit sub-scores with intent-specific overrides

**Data loaded once per request:**
- `data/cards_data.json` — all card definitions, sanitized on load

---

## 3. Layer by Layer Breakdown

### Layer 1 — Intent Detection
**File:** `engine/intent.py` → `detect_intent(survey_data)`  
**Called from:** `scorer.py:rank_cards()`

**What it measures:** What outcome the user is trying to maximize. Intent determines which cards are relevant and how fit sub-scores are weighted.

**Seven possible intents:**
`travel`, `cashback`, `maximize_rewards`, `premium_lifestyle`, `low_interest`, `business`, `build_credit`

**Signals and their point contributions (additive):**

| Signal | Condition | Score added to intent |
|--------|-----------|----------------------|
| Employment = student | — | +30 build_credit, +20 low_interest |
| Employment = business_owner | — | +25 business, +10 maximize_rewards |
| Income = above_25L | — | +25 premium_lifestyle, +15 maximize_rewards |
| Income = 10_25L | — | +15 maximize_rewards, +10 travel |
| Income = below_3L or 3_6L | — | +20 build_credit, +15 low_interest, +15 cashback |
| Existing cards = 0 | — | +20 build_credit |
| Credit score < 700 | below_650 or 650_700 | +25 build_credit, +10 low_interest |
| Fee pref = zero_only | — | +10 build_credit, +5 cashback, +10 low_interest |
| Fee pref = fee_doesnt_matter | — | +15 premium_lifestyle, +10 travel |
| travel_spend > 25% of total | ratio threshold | +30 travel, +10 premium_lifestyle |
| food_delivery > 20% of total | ratio threshold | +20 cashback, +10 maximize_rewards |
| online_shopping > 25% of total | ratio threshold | +15 cashback, +15 maximize_rewards |
| fuel > 15% of total | ratio threshold | +20 cashback |
| upi > 30% of total | ratio threshold | +15 cashback, +10 maximize_rewards |
| international > 15% of total | ratio threshold | +20 travel, +10 premium_lifestyle |
| Domestic flights = 4_8 or 9_plus | — | +20 travel |
| Domestic flights = 1_3 | — | +10 travel |
| International flights = 3_5 or 5_plus | — | +25 travel, +15 premium_lifestyle |
| International flights = 1_2 | — | +15 travel |
| Lounge needed = 3_4 or unlimited | — | +20 travel, +15 premium_lifestyle |
| Lounge needed = 1_2 | — | +10 travel |
| Card preference = cashback | — | +30 cashback |
| Card preference = reward_points | — | +30 maximize_rewards |
| Card preference = travel_miles | — | +30 travel |
| Concierge = true | — | +20 premium_lifestyle |
| Golf = true | — | +15 premium_lifestyle |

After signals are summed, dominant signal detection runs (see Section 4) and may add further boosts. The intent with the highest total is `primary`; the second-highest is `secondary`.

**Score of 100:** Intent perfectly aligns with card purpose (e.g., user is a heavy traveler, card is a dedicated travel card).  
**Score of 0:** Intent completely misaligned (e.g., student building credit recommended a luxury lifestyle card).

**Cards that typically score high:**
- `travel`: Axis Bank Atlas, HDFC Diners Black, Standard Chartered Ultimate
- `cashback`: Axis ACE, IDFC First Classic, Amazon Pay ICICI
- `maximize_rewards`: HDFC Regalia Gold, HSBC Premier, Amex MRCC
- `premium_lifestyle`: HDFC Diners Black, Axis Magnus
- `build_credit`: Lifetime-free, low-fee cards from SBI/Kotak

---

### Layer 2 — Fit Scoring
**File:** `engine/scorer.py` → `score_fit_layer(card, user_profile, intent_data, rupee_value, user_spend)`  
**Config:** `config/fit_weights.json`

**What it measures:** How well a card's features match the user's needs, independent of the card's type label. A high intent score says "this card is for your type of user"; a high fit score says "this card's specific features match your specific inputs."

**Sub-scores (each 0–100):**

| Sub-score | What it checks |
|-----------|----------------|
| `annual_fee_alignment` | Fee vs user's fee preference; waiver-aware (75 if waiver exists) |
| `reward_rate_match` | Annual rupee value as % of annual spend: ≥4% → 100, ≥3% → 85, ≥2% → 70, ≥1% → 50 |
| `welcome_bonus_value` | Amortized over 3 years: >₹5K → 100, >₹2K → 70, >₹500 → 40 |
| `travel_benefits_depth` | Lounge visits (domestic + intl) + travel insurance coverage |
| `lounge_access` | Quarterly visits vs user's stated `lounge_visits_needed` |
| `cashback_structure` | Reward type (cashback/points) vs user's `card_preference` |
| `additional_perks` | Golf (if requested), movies, concierge (if requested), OTT, dining program |
| `bank_relationship` | 100 if user banks with card issuer, 50 otherwise |
| `network_preference` | Fixed at 70 (no explicit user preference captured yet) |
| `digital_experience` | UPI support (+40), Google Pay (+20), no-cost EMI (+20), virtual card (+20); UPI-heavy spenders get +5/10/15 extra |

**Weights are intent-driven** — the base weights shift significantly per intent:

| Sub-score | Base | travel | cashback | maximize_rewards | premium_lifestyle | build_credit |
|-----------|------|--------|----------|-----------------|-------------------|--------------|
| annual_fee_alignment | 20% | 10% | 20% | 15% | 5% | 35% |
| reward_rate_match | 15% | 15% | 25% | 30% | 10% | 10% |
| welcome_bonus_value | 10% | 5% | 10% | 20% | 15% | 5% |
| travel_benefits_depth | 10% | **40%** | 5% | 5% | 25% | 0% |
| lounge_access | 10% | **20%** | 0% | 5% | 15% | 0% |
| cashback_structure | 10% | 5% | **35%** | 15% | 5% | 10% |
| additional_perks | 10% | 5% | 5% | 10% | **25%** | 0% |
| bank_relationship | 5% | 0% | 0% | 0% | 0% | 20% |
| digital_experience | 5% | 0% | 0% | 0% | 0% | 20% |
| network_preference | 5% | 0% | 0% | 0% | 0% | 0% |

**Score of 100:** Every sub-score maxes out — fee waived, reward rate >4%, full lounge coverage, exact preference match, bank relationship exists.  
**Score of 0:** Fee wildly over preference, no rewards, no perks, wrong reward type.

---

### Layer 3 — Eligibility Scoring
**File:** `engine/scorer.py` → `score_eligibility_layer(card, user_profile)`

**What it measures:** Whether the user is likely to be approved. Cards where the user doesn't qualify should not rank highly even if they're theoretically a great match.

**Sub-scores and weights:**

| Factor | Weight | Logic |
|--------|--------|-------|
| Credit score | 40% | ≥ card minimum → 100; within 50 pts below → 60; within 100 → 30; further below → 10 |
| Income | 25% | ≥ card minimum → 100; ≥80% of minimum → 60; ≥60% → 30; below 60% → 10 |
| Employment type | 15% | Matches `eligible_employment` list → 100; else → 30 |
| Bank relationship | 10% | User banks with issuer → 100; `parent_bank_required=false` → 60; required but absent → 10 |
| Age | 10% | Always 100 (age not collected; assumed 25+) |

**Credit score mapping (string → numeric):**

| Field value | Numeric |
|-------------|---------|
| `below_650` | 600 |
| `650_700` | 675 |
| `700_750` | 725 |
| `750_800` | 775 |
| `above_800` | 820 |
| `dont_know` | 700 |

**Invite-only gate:** If `card.eligibility.invite_only = true` and user income < ₹20L, eligibility is capped at 20 regardless of other factors.

**Score of 100:** User meets every threshold comfortably; banks with the issuer; employment type matches.  
**Score of 0/10:** User income and credit score are both well below card minimums; card requires parent bank relationship but user has none.

**Cards that typically score low:**
- HDFC Diners Club Black (invite_only + high income requirement)
- Premium Amex cards (strict income thresholds)

---

### Layer 4 — Rupee Value Calculation
**File:** `engine/scorer.py` → `calculate_annual_rupee_value(card, user_spend)`

**What it measures:** The actual rupee value a user would extract from the card per year, given their specific spend mix. This is the most objective layer.

**Calculation per category:**
```
monthly_points = (monthly_spend / 100) × category_rate
monthly_points = min(monthly_points, monthly_cap_points)  # if cap exists
monthly_value  = monthly_points × best_point_value
annual_value   = monthly_value × 12
```

- `best_point_value` = highest numeric value in `point_value` dict (e.g., travel redemption beats statement credit)
- Categories with `excluded: true` in card data are skipped entirely (e.g., tax, EMI for most cards)
- If no category-specific rate exists, falls back to `base_earn_rate`

**Milestones:** If annual spend crosses a milestone threshold, the bonus points (× best_point_value) are added.

**Welcome bonus:** Added as `(welcome_points × best_point_value) / 3` — amortized over 3 years to avoid over-weighting signup bonuses.

**Fee deduction:** Annual fee is subtracted unless:
- `is_lifetime_free = true`, OR
- `annual_spend >= annual_fee_waiver_threshold`

**Normalization (in `rank_cards`):** After all cards are scored, the raw rupee totals are normalized to 0–100 relative to the best and worst performers in the current run. This prevents a single high-value card from distorting the absolute score.

```python
rupee_value_score = ((raw - min_rupee) / (max_rupee - min_rupee)) × 100
```

**Score of 100:** Card generates the highest rupee value of all candidates for this specific spend profile.  
**Score of 0:** Card generates the lowest (possibly negative if fee exceeds earned rewards).

---

### Layer 5 — Competitive Scoring
**File:** `engine/scorer.py` → `score_competitive_layer(card, all_cards, top_cards_so_far)`

**What it measures:** A small structural adjustment for card portfolio fit. Cards that complement the user's likely portfolio get a boost; cards that directly compete with already-ranked cards get a small penalty.

**Signals (from `engine_meta` in card data):**

| Condition | Score change |
|-----------|-------------|
| Base score | 50 |
| Top-3 card is in this card's `complementary_cards` list | +25 per match |
| Top-3 card is in this card's `competes_with` list | −15 per match |

Score clamped to [0, 100].

**Important:** Competitive scoring runs *after* the first-pass sort. It sees who is already in the top 3, so it adjusts based on the actual emerging ranking, not a hypothetical one.

**Score of 100:** Card complements every top-3 card.  
**Score of 0:** Card directly competes with all top-3 cards (unusual — typically stays near 50).

---

### Final Score Formula
**File:** `engine/scorer.py` → `rank_cards()` (final sort)  
**Config:** `config/scoring_functions.json`

```
final_score = (intent × 0.25)
            + (fit × 0.25)
            + (eligibility × 0.25)
            + (rupee_value_score × 0.20)
            + (competitive × 0.05)
```

The sort happens twice: first without competitive (to determine top-3 for competitive scoring), then again with all five components.

---

## 4. Dominant Signal Detection

**File:** `engine/intent.py` → `detect_dominant_signal(user_spend)`  
**Called from:** `detect_intent()` after the base signal scoring.

**What it does:** Checks if a single spend category dominates the user's total spend. If it does, it applies a scaled boost to specific intents beyond the normal ratio-threshold signals above.

**The 5 signals and their intent boosts:**

| Signal | Spend key | Intent boosts |
|--------|-----------|---------------|
| `upi` | `upi_spend` | cashback +25, maximize_rewards +10 |
| `travel` | `travel_spend` | travel +30, premium_lifestyle +10 |
| `food` | `food_delivery_spend` | cashback +20, maximize_rewards +10 |
| `shopping` | `online_shopping_spend` | cashback +15, maximize_rewards +15 |
| `fuel` | `fuel_spend` | cashback +25 |

**Threshold:** `DOMINANT_THRESHOLD = 0.35` — a signal fires only if that category is ≥35% of total spend across all 15 categories.

**Scaling:** The boost is not applied at full strength unless the ratio is exactly 0.35. It scales linearly:
```python
scale = dominant_ratio / DOMINANT_THRESHOLD
boosted_amount = base_boost × scale
```
So if UPI is 70% of spend (2× the threshold), the cashback boost is +50 instead of +25.

**Only one signal fires per request** — the category with the highest ratio, if it crosses the threshold. If no category hits 35%, `dominant_signal = null` and no boost is applied.

**Response fields:** `dominant_signal` and `dominant_ratio` are returned in the API response for debugging and frontend display.

**Which cards benefit most:**
- UPI dominant → IDFC First Classic, Axis ACE, Slice (UPI credit cards with high UPI earn rates)
- Travel dominant → Axis Atlas, HDFC Diners Black (high travel category rates)
- Food dominant → Swiggy HDFC, Amazon Pay ICICI (food delivery multipliers)
- Shopping dominant → Amazon Pay ICICI, Flipkart Axis
- Fuel dominant → BPCL SBI, IndianOil Axis (fuel surcharge waiver + bonus)

---

## 5. Data Sanitizer

**File:** `engine/data_sanitizer.py` → `load_and_sanitize_cards(filepath=None)`

**Purpose:** Card data in `cards_data.json` is maintained manually. The sanitizer catches common authoring mistakes at load time and either fixes them automatically or skips the card entirely.

**8 categories of issues caught and fixed:**

| Category | Function | What it fixes |
|----------|----------|---------------|
| Fees | `sanitize_fees()` | Non-numeric `annual_fee` → 0; missing `joining_fee` → 0; invalid `is_lifetime_free` → derived from `annual_fee == 0` |
| Eligibility | `sanitize_eligibility()` | Missing `min_income_salaried` → 300000; missing `min_credit_score` → 650; missing `min_age` → 18 |
| Point values | `sanitize_point_value()` | Non-dict `point_value` → `{"default": 0.25}`; non-numeric values within dict → removed; empty result → `{"default": 0.25}` |
| Milestones | `sanitize_milestones()` | Non-list → `[]`; individual milestones missing `spend_threshold` or `bonus_points` → skipped |
| Category rates | `sanitize_category_rates()` | Non-dict → `{}`; keys starting with `_` or containing "note" → dropped; non-numeric `rate` → set to 0 |
| Intent tags | `sanitize_best_for_profile()` | Tags not in valid intent list → mapped via `INTENT_TAG_MAP` (e.g., `"fuel"` → `"cashback"`, `"miles"` → `"travel"`) or dropped; empty result → `["maximize_rewards"]` |

**When sanitizer catches an issue:** The fix is applied silently and a `[sanitizer]` prefixed log line is printed to stdout. The card is still included in the loaded set.

**When a card is skipped entirely:** If any sanitizer function throws an unhandled exception for a card (e.g., completely malformed JSON structure), that card is excluded from the run with an `[sanitizer] ERROR` log. All other cards are unaffected.

**What it cannot fix (requires manual correction):**
- Wrong category rates (e.g., fuel rate entered as 5 when it should be 1)
- Missing `category_rates` sections (excluded categories silently earn nothing)
- Wrong `engine_meta.competes_with` or `complementary_cards` references
- Incorrect `annual_fee_waiver_threshold` values
- Wrong `network` field (invalid network logo will silently fail to render)

**Output:** `load_and_sanitize_cards()` prints a summary: `[sanitizer] N cards loaded, M issues fixed`

---

## 6. API Reference

### POST /api/recommend

**Request schema:**

```json
{
  "profile": {
    "income":                "10_25L",        // string: below_3L | 3_6L | 6_10L | 10_25L | above_25L
    "employment":            "salaried",      // string: salaried | self_employed | business_owner | student
    "credit_score":          "750_800",       // string: below_650 | 650_700 | 700_750 | 750_800 | above_800 | dont_know
    "fee_preference":        "up_to_5000",    // string: zero_only | up_to_1000 | up_to_5000 | fee_doesnt_matter
    "bank_accounts":         ["HDFC Bank"],   // string[]: bank names (must match bank_name in cards_data.json)
    "existing_cards":        1,               // integer: 0+
    "total_spend_range":     "40_75K",        // string: under_10K | 10_20K | 20_40K | 40_75K | 75K_plus
    "lounge_visits_needed":  "1_2",           // string: "0" | 1_2 | 3_4 | unlimited
    "card_preference":       "reward_points", // string: reward_points | cashback | travel_miles
    "concierge":             false,           // boolean
    "golf":                  false,           // boolean
    "domestic_flights":      "4_8",           // string: "0" | 1_3 | 4_8 | 9_plus
    "international_flights": "1_2"            // string: "0" | 1_2 | 3_5 | 5_plus
  },
  "spend": {
    "total_spend_range":     "40_75K",        // string: same as profile.total_spend_range
    "food_delivery_spend":   5000,            // integer: monthly spend in rupees
    "groceries_spend":       3000,
    "dining_spend":          4000,
    "online_shopping_spend": 8000,
    "fuel_spend":            2000,
    "upi_spend":             5000,
    "travel_spend":          8000,
    "entertainment_spend":   2000,
    "pharmacy_spend":        1000,
    "international_spend":   5000,
    "emi_spend":             2000,            // excluded from most card earn rates
    "rent_spend":            0,              // most cards earn reduced/no rewards
    "education_spend":       0,
    "tax_spend":             0,              // excluded by most cards
    "insurance_spend":       0
  }
}
```

**Response schema (success):**

```json
{
  "success": true,
  "detected_intent":  "travel",              // string: primary intent
  "secondary_intent": "maximize_rewards",    // string: secondary intent
  "dominant_signal":  "travel",              // string | null
  "dominant_ratio":   0.2353,               // float: ratio of dominant category to total spend
  "recommendations": [
    {
      "card_id":                "hdfc_diners_black",
      "card_name":              "HDFC Diners Club Black Credit Card",
      "bank_name":              "HDFC Bank",
      "network":                "diners",          // visa | mastercard | amex | diners | rupay
      "annual_fee":             10000,             // integer: listed annual fee
      "joining_fee":            0,                 // integer
      "is_lifetime_free":       false,             // boolean
      "effective_fee":          0,                 // integer: 0 if waived or LTF
      "fee_waived":             true,              // boolean
      "fee_waiver_threshold":   500000,            // integer | null: annual spend needed for waiver
      "estimated_annual_reward": 29956.93,         // float: net annual value (rupees, after fee if paid)
      "final_score":            90.19,             // float: weighted composite score
      "rupee_value_score":      100.0,             // float: normalized 0-100 across this run's cards
      "score_breakdown": {
        "intent":      100.0,
        "fit":         90.75,
        "eligibility": 80.0,
        "competitive": 50
      },
      "reward_rate":   "3.33x",                   // string: base earn rate formatted
      "best_for":      ["premium_lifestyle", "travel", "maximize_rewards"],  // string[]
      "card_tier":     "super_premium",            // string: entry | mid | premium | super_premium
      "benefit_flags": {
        "welcome_bonus": true,
        "travel":        true,
        "lounge":        true,
        "fuel":          false,
        "dining":        true,
        "shopping":      false,
        "upi":           true,
        "cashback":      false
      },
      "reasons": [
        "Your ₹8,000/month on Travel earns approx ₹3,196/year",
        "Provides 6 quarterly lounge visits — matches your requirement",
        "Annual fee ₹10,000 is well justified — estimated reward value ₹29,956/year",
        "Match score: Intent 100/100 · Fit 91/100 · Eligibility 80/100"
      ],
      "rupee_breakdown": {
        "travel": {
          "monthly_spend":  8000,
          "monthly_points": 266.4,
          "annual_value":   3196.8
        }
        // ... one entry per non-zero spend category
      }
    }
    // ... up to 5 cards total
  ]
}
```

**Error response:**

```json
{
  "success": false,
  "error": "string describing what went wrong"
}
```
HTTP status: 500.

---

### GET /api/health

**Response:**

```json
{
  "status": "ok",
  "message": "Finoptima engine running"
}
```

---

## 7. Scoring Weights (Current)

| Layer | Weight | Rationale |
|-------|--------|-----------|
| Intent | 25% | Without intent alignment, recommendations feel off even if the card is technically strong. A cashback card should never top a travel user's list. |
| Fit | 25% | Intent says what category; fit says whether this specific card's features actually match. Equal weight because a perfectly-intentioned card with poor features is useless. |
| Eligibility | 25% | A card the user can't get approved for is worthless. Equal weight enforces that approval likelihood is non-negotiable, not just a tiebreaker. |
| Rupee Value | 20% | Slightly lower than the other three because it's already indirectly captured in fit (`reward_rate_match`). The rupee layer adds precision across cards within the same tier. |
| Competitive | 5% | Small intentional nudge for portfolio diversity. Low weight because the engine should not let portfolio theory override a genuinely better card. |

**Why equal 25% for intent/fit/eligibility:** In user testing, any imbalance between these three produced counterintuitive results — either ineligible cards surfacing, or eligible-but-wrong-category cards dominating. Equal weight maintains the tension between all three constraints.

---

## 8. Known Limitations

**1. Point-value assumptions are static**  
The engine uses the highest redemption value in `point_value` for all categories. Cards with category-specific redemption rates (e.g., Amex points worth more when transferred to airlines) may be undervalued if the user's actual redemption behavior is different.

**2. Fee waiver is estimated, not guaranteed**  
The engine compares the user's stated monthly spend (annualized) against `annual_fee_waiver_threshold`. This assumes every spend category contributes to the waiver — which is not always true (some cards exclude fuel or rent from waiver tracking).

**3. Welcome bonus is amortized, which penalizes high-signup-bonus cards for long-term users**  
Dividing by 3 is appropriate for new-to-credit users but undervalues these cards for experienced users who are comfortable churning.

**4. No soft credit inquiry simulation**  
Eligibility is scored on a gradient, not a hard cutoff. A user with a 725 score applying for a card requiring 750 gets a 60/100 eligibility — which may still let the card rank. The engine intentionally avoids hard blocks to preserve optionality, but this means some recommendations may be declined in practice.

**5. Bank relationship matching is string-based**  
`"HDFC Bank"` in `bank_accounts` is matched with `card.bank_name.lower().contains()`. Variations like `"HDFC"` or `"hdfc bank"` may fail silently — the bank relationship bonus won't apply.

**6. No real-time availability or application status**  
The engine does not check if a card is currently open to applications, has waitlists, or has regional restrictions. Card data must be manually kept current.

**7. Competitive layer is only evaluated against the top 3**  
Cards at ranks 4–5 in the first-pass sort use `top_cards_so_far = []`, giving them a base score of 50. The competitive layer has minimal impact on the final top-5 ordering.

**8. Categories not covered:** Wallet recharges, bill payments, transit cards, children's education (distinct from `education_spend`) — all mapped to either a general rate or excluded.

---

## 9. Backtest Reference

**File:** `tests/backtest.py`  
**Run from backend directory:** `python tests/backtest.py`

**5 test profiles and their validation rules:**

| Test | Profile | Key rules |
|------|---------|-----------|
| **T1** Student Zero Fee | ₹3-6L income, student, zero_only fee, SBI+Kotak accounts, UPI-heavy (₹2K/month) | All top 5 must have zero effective fee; intent must be build_credit or cashback |
| **T2** Premium Traveler | ₹25L+ income, self-employed, HDFC+ICICI, ₹30K/month travel, 9+ domestic + 3-5 intl flights, fee_doesnt_matter | Intent must be travel or premium_lifestyle; dominant signal must be travel; rank 1 reward ≥ ₹5,000/yr |
| **T3** UPI Heavy Digital | ₹6-10L, Axis+IDFC, ₹8K UPI (80% of spend), up_to_1000 fee pref, no lounge needed | Intent must be cashback or maximize_rewards; dominant signal must be upi; all top 3 effective fee ≤ ₹1,000 |
| **T4** Fuel Heavy Driver | ₹6-10L, HDFC only, ₹15K fuel (68% of spend), up_to_1000 fee pref | Intent must be cashback; dominant signal must be fuel; all top 3 effective fee ≤ ₹1,000 |
| **T5** Balanced Mid Income | ₹10-25L, HDFC+ICICI, up_to_5000 fee pref, 1-3 domestic flights, balanced spend mix | Intent must be maximize_rewards or travel; all top 5 effective fee ≤ ₹5,000; rank 1 reward ≥ ₹3,000/yr |

**What a failing test means:**

| Failure type | Likely cause |
|-------------|--------------|
| Intent not in expected | A spend signal or Layer 3 signal is misconfigured, or a dominant signal is overriding the expected intent |
| Dominant signal not in expected | A different category is now ≥35% of spend (check spend values) |
| Fee exceeds limit in top N | A high-fee card's `annual_fee_waiver_threshold` is too low, pushing it into results despite fee preference; or fee alignment weight is too low |
| Reward below minimum | Best card's earn rates or point values are incorrect in cards_data.json |

**Backtest does not make HTTP requests** — it calls `rank_cards()` directly. If the API is unreachable, backtest still works.

---

## 10. How to Add New Cards

**Step 1 — Duplicate an existing card entry in `data/cards_data.json`**  
Choose a card of similar tier and type as your starting template. The closest structural match minimizes authoring errors.

**Step 2 — Set required fields:**

```json
{
  "card_id":   "bank_cardname",           // snake_case, unique across all cards
  "card_name": "Full Official Card Name",
  "bank_name": "Bank Name",              // must match exactly what appears in bank_accounts
  "network":   "visa",                   // visa | mastercard | amex | diners | rupay
  "card_tier": "mid",                    // entry | mid | premium | super_premium
  "fees": { ... },
  "eligibility": { ... },
  "rewards": { ... },
  "category_rates": { ... },
  "travel_benefits": { ... },
  "lifestyle_benefits": { ... },
  "digital": { ... },
  "engine_meta": { ... }
}
```

**Step 3 — Fill `engine_meta` carefully:**

```json
"engine_meta": {
  "best_for_profile":    ["travel", "maximize_rewards"],  // valid intents only
  "competes_with":       ["hdfc_regalia", "sc_ultimate"], // card_ids of direct competitors
  "complementary_cards": ["axis_ace"]                     // card_ids that pair well with this one
}
```

`best_for_profile` values must be from: `travel`, `cashback`, `maximize_rewards`, `premium_lifestyle`, `low_interest`, `business`, `build_credit`. Anything else will be mapped or dropped by the sanitizer.

**Step 4 — Set `category_rates` for every spend category:**  
Use the same key names as in the `category_map` in `scorer.py`:

```
food_delivery, groceries, dining, online_shopping, fuel, upi, travel,
entertainment, pharmacy, international_forex, rent, education, tax,
insurance, emi
```

For excluded categories (no earn): `{ "excluded": true }`. Do not omit the key — omitting it falls back to `base_earn_rate` which may be incorrect.

**Step 5 — Run backtest to verify no regressions:**

```bash
cd backend
python tests/backtest.py
```

All 5 tests must pass. If a test flips from PASS to FAIL, the new card may be incorrectly structured or its scores are displacing a card that was previously carrying a test case.

**Common mistakes to avoid:**

| Mistake | Effect |
|---------|--------|
| `best_for_profile` tag not in valid intent list | Sanitizer drops it; card defaults to `["maximize_rewards"]` |
| `point_value` has a string value instead of float | Sanitizer removes that entry; best_pv may drop to 0.25 |
| `annual_fee_waiver_threshold` missing | Engine never waives fee even if user spends enough |
| `is_lifetime_free: true` with `annual_fee: 5000` | Fee alignment scores 100 but rupee value still deducts nothing — fee_waived logic in app.py uses is_lifetime_free |
| Omitting `monthly_cap_points` on fuel | Fuel overstates earn for high-fuel users |
| Incorrect `competes_with` card_id | Silent failure — competitive adjustment does not fire |

See `CARD_DATA_README.md` for the full field schema with types, defaults, and examples.
