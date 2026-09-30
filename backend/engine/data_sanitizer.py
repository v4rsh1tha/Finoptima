import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

VALID_INTENTS = [
    "travel",
    "cashback",
    "maximize_rewards",
    "premium_lifestyle",
    "low_interest",
    "business",
    "build_credit"
]

INTENT_TAG_MAP = {
    # Spend-category aliases → intent
    "fuel": "cashback",
    "upi_primary": "cashback",
    "shopping": "cashback",
    "dining": "cashback",
    "grocery": "cashback",
    "groceries": "cashback",
    "healthcare": "cashback",
    "utility_bills": "cashback",
    "entertainment": "maximize_rewards",
    "rewards": "maximize_rewards",
    # Travel variants
    "forex": "travel",
    "airline_miles": "travel",
    "miles": "travel",
    "airport_lounge": "travel",
    # Premium variants
    "luxury_travel": "premium_lifestyle",
    "hotel": "premium_lifestyle",
    "concierge_service": "premium_lifestyle",
    # Credit-building variants
    "student": "build_credit",
    "secured": "build_credit",
    # Business variants
    "business_rewards": "business",
}


def sanitize_point_value(card_name, point_value):
    if not isinstance(point_value, dict):
        print(f"[sanitizer] {card_name}: point_value is not a dict — using default")
        return {"default": 0.25}

    clean = {}
    for k, v in point_value.items():
        if isinstance(v, (int, float)):
            clean[k] = v
        else:
            print(f"[sanitizer] {card_name}: removing non-numeric point_value['{k}'] = {repr(v)}")

    if not clean:
        print(f"[sanitizer] {card_name}: no numeric point_values found — using default 0.25")
        return {"default": 0.25}

    return clean


def sanitize_milestones(card_name, milestones):
    if not isinstance(milestones, list):
        print(f"[sanitizer] {card_name}: milestones is not a list — using empty")
        return []

    clean = []
    for i, m in enumerate(milestones):
        if not isinstance(m, dict):
            print(f"[sanitizer] {card_name}: milestone[{i}] is not a dict — skipping")
            continue
        if not isinstance(m.get("spend_threshold"), (int, float)):
            print(f"[sanitizer] {card_name}: milestone[{i}] missing numeric spend_threshold — skipping")
            continue
        if not isinstance(m.get("bonus_points"), (int, float)):
            print(f"[sanitizer] {card_name}: milestone[{i}] missing numeric bonus_points — skipping")
            continue
        clean.append(m)

    return clean


def sanitize_best_for_profile(card_name, tags):
    if not isinstance(tags, list) or not tags:
        return ["maximize_rewards"]

    clean = []
    seen = set()
    for tag in tags:
        if tag in VALID_INTENTS:
            mapped = tag
        elif tag in INTENT_TAG_MAP:
            mapped = INTENT_TAG_MAP[tag]
            print(f"[sanitizer] {card_name}: mapped best_for_profile tag '{tag}' → '{mapped}'")
        else:
            print(f"[sanitizer] {card_name}: unknown best_for_profile tag '{tag}' — dropping")
            continue

        if mapped not in seen:
            seen.add(mapped)
            clean.append(mapped)

    if not clean:
        print(f"[sanitizer] {card_name}: no valid tags after mapping — defaulting to maximize_rewards")
        return ["maximize_rewards"]

    return clean


def sanitize_category_rates(card_name, rates):
    if not isinstance(rates, dict):
        print(f"[sanitizer] {card_name}: category_rates is not a dict — using empty")
        return {}

    clean = {}
    for key, value in rates.items():
        # Drop note-style keys (keys that start with _ or contain "note")
        if key.startswith("_") or "note" in key.lower():
            print(f"[sanitizer] {card_name}: dropping note key '{key}' from category_rates")
            continue

        if not isinstance(value, dict):
            print(f"[sanitizer] {card_name}: category_rates['{key}'] is not a dict — skipping")
            continue

        cat_clean = dict(value)
        rate = cat_clean.get("rate")
        if rate is not None and not isinstance(rate, (int, float)):
            print(f"[sanitizer] {card_name}: category_rates['{key}']['rate'] = {repr(rate)} is non-numeric — setting to 0")
            cat_clean["rate"] = 0

        clean[key] = cat_clean

    return clean


def sanitize_fees(card_name, fees):
    if not isinstance(fees, dict):
        print(f"[sanitizer] {card_name}: fees is not a dict — using defaults")
        return {"annual_fee": 0, "joining_fee": 0, "is_lifetime_free": True}

    clean = dict(fees)

    if not isinstance(clean.get("annual_fee"), (int, float)):
        print(f"[sanitizer] {card_name}: missing/invalid annual_fee — defaulting to 0")
        clean["annual_fee"] = 0

    if not isinstance(clean.get("joining_fee"), (int, float)):
        clean["joining_fee"] = 0

    if not isinstance(clean.get("is_lifetime_free"), bool):
        clean["is_lifetime_free"] = clean["annual_fee"] == 0

    return clean


def sanitize_eligibility(card_name, eligibility):
    if not isinstance(eligibility, dict):
        print(f"[sanitizer] {card_name}: eligibility is not a dict — using defaults")
        return {
            "min_income_salaried": 300000,
            "min_credit_score": 650,
            "min_age": 18
        }

    clean = dict(eligibility)

    if not isinstance(clean.get("min_income_salaried"), (int, float)):
        clean["min_income_salaried"] = 300000

    if not isinstance(clean.get("min_credit_score"), (int, float)):
        clean["min_credit_score"] = 650

    if not isinstance(clean.get("min_age"), (int, float)):
        clean["min_age"] = 18

    return clean


def load_and_sanitize_cards(filepath=None):
    if filepath is None:
        filepath = os.path.join(BASE_DIR, "data", "cards_data.json")

    with open(filepath, encoding="utf-8") as f:
        raw_cards = json.load(f)

    clean_cards = []
    issues_fixed = 0

    for card in raw_cards:
        card_name = card.get("card_name", card.get("card_id", "unknown"))
        try:
            # Sanitize fees
            original_fees = card.get("fees", {})
            card["fees"] = sanitize_fees(card_name, original_fees)

            # Sanitize eligibility
            card["eligibility"] = sanitize_eligibility(card_name, card.get("eligibility", {}))

            # Sanitize rewards.point_value
            rewards = card.get("rewards", {})
            original_pv = rewards.get("point_value", {})
            clean_pv = sanitize_point_value(card_name, original_pv)
            if clean_pv != original_pv:
                issues_fixed += 1
            rewards["point_value"] = clean_pv

            # Sanitize rewards.milestones
            original_ms = rewards.get("milestones", [])
            clean_ms = sanitize_milestones(card_name, original_ms)
            if len(clean_ms) != len(original_ms):
                issues_fixed += len(original_ms) - len(clean_ms)
            rewards["milestones"] = clean_ms
            card["rewards"] = rewards

            # Sanitize category_rates
            original_cr = card.get("category_rates", {})
            clean_cr = sanitize_category_rates(card_name, original_cr)
            if len(clean_cr) != len(original_cr):
                issues_fixed += len(original_cr) - len(clean_cr)
            card["category_rates"] = clean_cr

            # Sanitize engine_meta.best_for_profile
            engine_meta = card.get("engine_meta", {})
            original_tags = engine_meta.get("best_for_profile", [])
            clean_tags = sanitize_best_for_profile(card_name, original_tags)
            if clean_tags != original_tags:
                issues_fixed += 1
            engine_meta["best_for_profile"] = clean_tags
            card["engine_meta"] = engine_meta

            clean_cards.append(card)

        except Exception as e:
            print(f"[sanitizer] ERROR processing card '{card_name}': {e} — skipping card")
            continue

    print(f"[sanitizer] {len(clean_cards)} cards loaded, {issues_fixed} issues fixed")
    return clean_cards
