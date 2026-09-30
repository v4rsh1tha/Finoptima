# Finoptima Card Data Schema & Contributor Guide

## Purpose

cards_data.json is the sole data source for the
Finoptima recommendation engine. Every field feeds
directly into scoring calculations.
Bad data = wrong recommendations = users get wrong cards.

The engine has a runtime sanitizer that catches
and fixes many issues automatically. But correct
data at source is always better than sanitizer fixes.

---

## Quick Reference — Most Common Mistakes

| Mistake | Effect | Fix |
|---------|--------|-----|
| String in point_value | Card silently excluded | Use float only |
| Invalid best_for_profile tag | Intent score = 0 | Use 7 valid values only |
| "international" not "international_forex" | Forex earn = 0 | Use exact key name |
| annual_fee_waiver_threshold: 0 | Waiver never applies | Omit field if no waiver |
| "note" key in category_rates | Rate data hidden | Remove all note keys |
| dining_program.program: null | Silent under-scoring | Omit dining_program entirely |
| Malformed milestone | Bonus silently zeroed | Use exact field names |
| card_tier wrong value | Beginner guard fails | Use hyphen: ultra-premium |

---

## Complete Schema Reference

### Top Level Fields

```
card_id
  Type: string, required
  Format: snake_case, unique across all cards
  Example: "hdfc_regalia_gold"

card_name
  Type: string, required
  Example: "HDFC Regalia Gold Credit Card"

bank_name
  Type: string, required
  Must match logo folder name exactly
  Valid values:
    "HDFC Bank", "Axis Bank", "ICICI Bank",
    "State Bank of India", "Kotak Mahindra Bank",
    "American Express", "IDFC FIRST Bank",
    "YES BANK", "Standard Chartered", "HSBC",
    "RBL Bank", "Federal Bank",
    "AU Small Finance Bank", "Bank of Baroda",
    "Equitas Small Finance Bank"

network
  Type: string, required
  Valid values: "visa" | "mastercard" |
    "rupay" | "amex" | "diners"

card_tier
  Type: string, required
  Valid values ONLY:
    "entry" | "mid" | "premium" | "ultra-premium"
  WARNING: Do NOT use "super_premium",
    "ultra_premium" (no hyphen), or "luxury"
  Note the hyphen in ultra-premium
  Affects: beginner eligibility cap

invite_only
  Type: boolean, optional, default false
  true = requires invitation or existing relationship
  Affects: eligibility score capped at 20
    for users with income below ₹20L

schema_version
  Type: integer, optional
  Set to 2 for all new cards
  Helps engine detect and handle old format cards
```

---

### fees Object

```
annual_fee
  Type: number (int or float), required
  In rupees as plain number
  DO NOT use: strings, currency symbols, GST
  Example: 2500 not "₹2,500" not "2500+GST"
  If lifetime free: 0
  Affects: fee alignment scoring,
    net reward calculation

joining_fee
  Type: number, optional, default 0
  One time fee in rupees

is_lifetime_free
  Type: boolean, required
  true ONLY if card has no annual fee EVER
  A card with fee waiver is NOT lifetime free
  Must be consistent: if annual_fee == 0
    then is_lifetime_free should be true

annual_fee_waiver_threshold
  Type: number or OMIT, optional
  Annual spend in rupees needed to waive fee
  Example: 300000 means spend ₹3L/year = fee waived
  WARNING: Do NOT set to 0 — zero is treated
    as falsy and waiver never applies
  If no waiver exists: OMIT this field entirely

forex_markup_percent
  Type: number or null, optional
  Example: 3.5 means 3.5% foreign transaction fee
  0 means zero forex markup
```

---

### eligibility Object

```
min_income_salaried
  Type: number, required
  Annual income in rupees as plain number
  Example: 600000 means ₹6 lakhs
  DO NOT use: "6 lakhs", "6L", "₹6,00,000"
  Default if unknown: 300000

min_income_self_employed
  Type: number, required
  Default if unknown: same as min_income_salaried

min_credit_score
  Type: number, required
  Example: 750
  Default if unknown: 700

min_age
  Type: number, default 21
max_age
  Type: number, default 65

eligible_employment
  Type: array of strings, required
  Valid values: "salaried" | "self_employed" |
    "business_owner" | "student"
  Must be array even for single value
  Example: ["salaried", "self_employed"]

parent_bank_required
  Type: boolean, default false
  true = user must have account with issuing bank
```

---

### rewards Object

```
reward_type
  Type: string, required
  Valid values: "points" | "cashback" | "miles"
  Affects: cashback preference matching in fit layer

base_earn_rate
  Type: number, required
  Points, miles, or cashback % per ₹100 spent
  Used as fallback rate for any category not
    listed in category_rates
  CRITICAL: Must be numeric. Never a string.
  Default: 1

point_value
  Type: object, required
  Maps redemption method to rupee value per point

  CRITICAL RULES — violations cause silent card exclusion:
  - Every value MUST be a number (float or int)
  - NEVER add "note" keys
  - NEVER use null values inside point_value
  - If transfer ratio is unknown: OMIT that key
  - At minimum always include "cashback" value
  - If all values are invalid sanitizer falls back
    to 0.25 — card will appear unprofitable

  Recommended fixed keys:
    cashback: 0.10 to 0.50
    travel_portal: 0.25 to 1.00
    airline_transfer: 0.50 to 2.00
    vouchers: 0.25 to 0.75

  WRONG examples that break the engine:
    "airline_transfer": "1:1 via SmartBuy"
    "note": "best value via SmartBuy portal"
    "airline_transfer": null
    "retail": "varies by merchant"

  CORRECT example:
    {"cashback": 0.25, "travel_portal": 0.50,
     "airline_transfer": 1.00}

welcome_bonus_points
  Type: number, default 0
  Total gross points/miles on joining
  Engine automatically amortizes over 3 years (÷3)
  Include full value — engine handles amortization

milestones
  Type: array of objects
  If no milestones: use empty array []
  Never use null

  Each milestone object MUST have EXACTLY:
    spend_threshold: number (annual rupees)
    bonus_points: number (points/miles awarded)
  Optional: period: "annual" or "quarterly"

  WRONG — silently dropped:
    {"spend": 500000, "reward": "voucher"}
    {"spend_threshold": "5L", "bonus_points": 10000}
    {"spend_threshold": 500000}  (missing bonus_points)

  CORRECT:
    {"spend_threshold": 500000, "bonus_points": 10000}
```

---

### category_rates Object

```
REQUIRED: All 15 categories must be present:
  food_delivery | groceries | dining |
  online_shopping | fuel | upi | travel |
  entertainment | pharmacy | international_forex |
  rent | education | tax | insurance | emi

CRITICAL: Use "international_forex" NOT "international"
  Using "international" silently zeros forex rewards

Each category is an object with:
  rate
    Type: number, required
    Points/miles/% per ₹100 in this category
    Same scale as base_earn_rate
    Use 0 if card gives nothing here
    NEVER a string, NEVER null

  excluded
    Type: boolean, optional, default false
    true = card explicitly blocks rewards here
    Common exclusions: tax, emi, government
    Example: "tax": {"rate": 0, "excluded": true}

  monthly_cap_points
    Type: number or null
    Maximum points earnable per month here
    null = no cap

  platforms
    Type: string, optional
    Which platforms qualify
    Example: "swiggy_only" or "all"

  stations
    Type: string, optional (fuel only)
    Example: "bpcl_only" or "all"

FORBIDDEN in category_rates:
  "note" keys — silently dropped but hide real data
  "_transaction_minimum" or any _ prefix key
  Any key not listed above

WRONG:
  "travel": {"rate": 5, "note": "via SmartBuy only"}
CORRECT:
  "travel": {"rate": 5, "platforms": "smartbuy"}
```

---

### travel_benefits Object

```
domestic_lounge.visits_per_quarter
  Type: number
  0 if no lounge access
  Use 12 or 99 for genuinely unlimited
  DO NOT use "unlimited" string
  Note: 999 is reserved for HDFC Infinia only

international_lounge.visits_per_year
  Type: number, 0 if none

travel_insurance.air_accident_cover
  Type: number or null
  In rupees. Example: 10000000 means ₹1 crore
```

---

### lifestyle_benefits Object

```
golf.available: boolean
golf.free_rounds_per_month: number

movies.free_tickets_per_month: number

concierge: boolean

dining_program
  If no dining program: OMIT this object entirely
  DO NOT use {"program": null}
  If program exists: {"program": "EazyDiner"}

ott_subscriptions: boolean or array
```

---

### digital Object

```
upi_credit_card
  Type: boolean
  CRITICAL: true ONLY for RuPay or UPI-enabled cards
  This triggers UPI dominant signal boost in scoring
  Affects: UPI-heavy users get these cards surfaced

google_pay: boolean
no_cost_emi: boolean
virtual_card: boolean
```

---

### engine_meta Object

```
best_for_profile
  Type: array of strings, required
  CRITICAL: Only these 7 exact values allowed:
    "travel"
    "cashback"
    "maximize_rewards"
    "premium_lifestyle"
    "build_credit"
    "low_interest"
    "business"

  Wrong tags cause intent score = 0 (card never recommended)
  The sanitizer maps common aliases but correct
  values at source prevent silent failures.

  WRONG values that break intent scoring:
    "fuel", "upi_primary", "upi", "forex",
    "luxury_travel", "hotel_stays",
    "food_delivery", "tata_ecosystem",
    "online_shopping", "tax_payments",
    "international_travel", "rewards",
    "co_branded", "rupay"

  Recommended: max 2-3 tags per card
  Primary use case first, secondary second

competes_with
  Type: array of card_id strings
  Every ID must exist in cards_data.json
  Sanitizer will warn on invalid references

complementary_cards
  Type: array of card_id strings
  Same validation as competes_with
```

---

## Valid Values Quick Reference

| Field | Valid Values |
|-------|-------------|
| card_tier | entry, mid, premium, ultra-premium |
| network | visa, mastercard, rupay, amex, diners |
| reward_type | points, cashback, miles |
| eligible_employment | salaried, self_employed, business_owner, student |
| best_for_profile | travel, cashback, maximize_rewards, premium_lifestyle, build_credit, low_interest, business |

---

## Silent Failure Fields

These fields cause the card to be completely
excluded from results with no visible error:

| Field | Failure Condition |
|-------|------------------|
| point_value | Any non-numeric value |
| annual_fee | null or string |
| min_income_salaried | missing |
| best_for_profile | all tags invalid (sanitizer saves this) |

---

## LLM Prompt for Card Data Generation

Use this prompt when converting raw card
information to JSON format:

---

You are converting Indian credit card data to
JSON for a recommendation engine.
Return only valid JSON. No markdown. No notes.
No explanatory text inside the JSON.

CRITICAL RULES:

1. point_value — every value must be a float.
   Convert ratios to rupee value per point.
   "1:1 airline transfer, 1 mile = ₹0.50" → 0.50
   Never add "note" keys. Never use null here.

2. category_rates — use "international_forex"
   not "international" for forex spend category.
   Never add "note" keys to category objects.
   Never add underscore-prefixed keys.

3. best_for_profile — only use these exact values:
   travel, cashback, maximize_rewards,
   premium_lifestyle, build_credit,
   low_interest, business

4. milestones — every object needs exactly:
   {"spend_threshold": NUMBER, "bonus_points": NUMBER}
   If milestone benefit is not points convert to
   equivalent points at base redemption rate.

5. All fee and income fields — plain numbers only.
   2500 not "₹2,500" not "2,500 + GST"
   300000 not "3 lakhs"

6. card_tier — only: entry, mid, premium, ultra-premium
   Note the hyphen.

7. annual_fee_waiver_threshold — omit entirely
   if no waiver exists. Never set to 0.

8. dining_program — omit entirely if card has
   no dining program. Never set program to null.

9. visits_per_quarter — use integer. Use 99
   for unlimited. Never use "unlimited" string.

10. Unknown values — use documented defaults
    for required fields. Omit optional fields.
    Never use "unknown", "N/A", or null for
    fields that should be numbers.

---

## Process for Adding New Cards

1. Gather data from official bank website,
   MITC document, cardinsider.com, technofino.com

2. Use the LLM prompt above to generate JSON

3. Run the validation checklist below

4. Add card object to cards_data.json array

5. Run backtest — all 5 tests must still pass:
   python tests/backtest.py

6. Restart Flask and verify new card appears
   in recommendations for a relevant profile

---

## Pre-Submission Checklist

- [ ] card_id is unique snake_case
- [ ] bank_name matches exact logo folder name
- [ ] card_tier uses hyphen: ultra-premium
- [ ] annual_fee is plain number not string
- [ ] is_lifetime_free true ONLY if truly free forever
- [ ] annual_fee_waiver_threshold omitted if no waiver
- [ ] annual_fee_waiver_threshold NOT set to 0
- [ ] base_earn_rate is numeric
- [ ] All point_value entries are numeric floats
- [ ] No "note" keys anywhere in point_value
- [ ] No null values inside point_value
- [ ] All milestones have spend_threshold AND bonus_points both as numbers
- [ ] All 15 category_rates keys present
- [ ] "international_forex" used not "international"
- [ ] No "note" keys in any category_rates object
- [ ] No underscore-prefixed keys in category_rates
- [ ] dining_program omitted if no program
- [ ] All best_for_profile tags from valid 7 only
- [ ] domestic_lounge visits_per_quarter is number
- [ ] upi_credit_card true only for RuPay/UPI cards
- [ ] No _data_notes field present
- [ ] competes_with card_ids exist in dataset
- [ ] complementary_cards card_ids exist in dataset

---

## Running Validation

After any changes to cards_data.json run:

```
python tests/backtest.py
```

All 5 tests must pass.
If any test fails the data change introduced
a regression and must be fixed before committing.

---

*Generated from audit of cards_data.json and
engine source code on 2026-03-24.
Engine version: post-fix v2 with dominant signal
detection, data sanitizer, and backtest harness.*
