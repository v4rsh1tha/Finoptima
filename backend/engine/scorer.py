import json
import os
import traceback
from functools import lru_cache

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@lru_cache(maxsize=None)
def load_config(filename):
    """Load and cache a JSON config file. Configs are static per process,
    so previously this was re-reading the same file from disk once per
    card per request (e.g. intent_adjacency.json was opened ~60 times
    for a single /api/recommend call). lru_cache keeps it in memory
    after the first read."""
    path = os.path.join(BASE_DIR, "config", filename)
    with open(path) as f:
        return json.load(f)

@lru_cache(maxsize=1)
def load_cards():
    """Load and cache the sanitized card catalog. Previously this parsed
    and sanitized the entire card dataset from disk on every single API
    request. lru_cache means it's only done once per process (or after
    a call to load_cards.cache_clear(), e.g. if you add a
    hot-reload/admin-refresh endpoint later)."""
    from engine.data_sanitizer import load_and_sanitize_cards
    return load_and_sanitize_cards()

def get_total_spend_midpoint(total_spend_range):
    mapping = {
        "under_10K": 6000,
        "10_20K": 15000,
        "20_40K": 28000,
        "40_75K": 55000,
        "75K_plus": 82000
    }
    return mapping.get(total_spend_range, 20000)

def calculate_annual_rupee_value(card, user_spend):
    total_value = 0
    category_breakdown = {}

    category_map = {
        "food_delivery": "food_delivery",
        "groceries": "groceries",
        "dining": "dining",
        "online_shopping": "online_shopping",
        "fuel": "fuel",
        "upi": "upi",
        "travel": "travel",
        "entertainment": "entertainment",
        "pharmacy": "pharmacy",
        "international": "international_forex",
        "rent": "rent",
        "education": "education",
        "tax": "tax",
        "insurance": "insurance",
        "emi": "emi"
    }

    rewards = card.get("rewards", {})
    point_values = rewards.get("point_value", {})
    numeric_pvs = [v for v in point_values.values() if isinstance(v, (int, float))]
    best_point_value = max(numeric_pvs) if numeric_pvs else 0.25

    for spend_key, card_key in category_map.items():
        monthly_spend = user_spend.get(f"{spend_key}_spend", 0)
        if monthly_spend == 0:
            continue

        cat_data = card.get("category_rates", {}).get(card_key, {})
        if not cat_data or cat_data.get("excluded", False):
            continue

        rate = cat_data.get("rate", rewards.get("base_earn_rate", 0))
        if rate == 0:
            continue

        points_earned = (monthly_spend / 100) * rate

        monthly_cap = cat_data.get("monthly_cap_points")
        if monthly_cap:
            points_earned = min(points_earned, monthly_cap)

        monthly_value = points_earned * best_point_value
        annual_value = monthly_value * 12
        total_value += annual_value

        category_breakdown[spend_key] = {
            "monthly_spend": monthly_spend,
            "monthly_points": round(points_earned, 2),
            "annual_value": round(annual_value, 2)
        }

    # Milestones
    annual_spend = sum([
        user_spend.get(f"{k}_spend", 0)
        for k in category_map.keys()
    ]) * 12

    for milestone in rewards.get("milestones", []):
        if annual_spend >= milestone.get("spend_threshold", 0):
            bonus = milestone.get("bonus_points", 0) * best_point_value
            total_value += bonus

    # Welcome bonus — amortized over 3 years
    welcome_points = rewards.get("welcome_bonus_points", 0) or 0
    total_value += (welcome_points * best_point_value) / 3

    # Subtract annual fee
    annual_fee = card["fees"]["annual_fee"]
    waiver_threshold = card["fees"].get("annual_fee_waiver_threshold", 0)

    if waiver_threshold and annual_spend >= waiver_threshold:
        pass  # Fee waived
    else:
        total_value -= annual_fee

    return {
        "total": round(total_value, 2),
        "breakdown": category_breakdown,
        "annual_fee_paid": annual_fee if not (
            waiver_threshold and annual_spend >= waiver_threshold
        ) else 0
    }

def score_intent_layer(card, intent_data):
    adjacency = load_config("intent_adjacency.json")
    matrix = adjacency["intent_adjacency"]

    primary_intent = intent_data["primary"]
    card_purpose = card.get("engine_meta", {}).get(
        "best_for_profile", ["maximize_rewards"]
    )

    if not card_purpose:
        card_purpose = ["maximize_rewards"]

    best_score = 0
    for cp in card_purpose:
        if primary_intent in matrix and cp in matrix[primary_intent]:
            score = matrix[primary_intent][cp]
            best_score = max(best_score, score)

    secondary_intent = intent_data.get("secondary", "")
    secondary_score = 0
    for cp in card_purpose:
        if secondary_intent in matrix and cp in matrix[secondary_intent]:
            secondary_score = max(
                secondary_score, matrix[secondary_intent][cp]
            )

    final_intent_score = (best_score * 0.75) + (secondary_score * 0.25)
    return round(final_intent_score, 2)

def score_eligibility_layer(card, user_profile):
    score = 0
    weights = {
        "credit_score": 40,
        "income": 25,
        "employment": 15,
        "bank_relationship": 10,
        "age": 10
    }

    # Credit score
    user_score_map = {
        "below_650": 600,
        "650_700": 675,
        "700_750": 725,
        "750_800": 775,
        "above_800": 820,
        "dont_know": 700
    }
    user_credit = user_score_map.get(
        user_profile.get("credit_score", "dont_know"), 700
    )
    card_min_credit = card["eligibility"].get("min_credit_score", 650)

    if user_credit >= card_min_credit:
        credit_score = 100
    elif user_credit >= card_min_credit - 50:
        credit_score = 60
    elif user_credit >= card_min_credit - 100:
        credit_score = 30
    else:
        credit_score = 10

    score += credit_score * (weights["credit_score"] / 100)

    # Income
    income_map = {
        "below_3L": 200000,
        "3_6L": 450000,
        "6_10L": 800000,
        "10_25L": 1750000,
        "above_25L": 3000000
    }
    user_income = income_map.get(user_profile.get("income", "6_10L"), 800000)
    employment = user_profile.get("employment", "salaried")

    if employment == "salaried":
        card_min_income = card["eligibility"].get(
            "min_income_salaried", 300000
        )
    else:
        card_min_income = card["eligibility"].get(
            "min_income_self_employed", 300000
        )

    if user_income >= card_min_income:
        income_score = 100
    elif user_income >= card_min_income * 0.8:
        income_score = 60
    elif user_income >= card_min_income * 0.6:
        income_score = 30
    else:
        income_score = 10

    score += income_score * (weights["income"] / 100)

    # Employment type
    eligible_employment = card["eligibility"].get(
        "eligible_employment", ["salaried"]
    )
    if employment in eligible_employment:
        score += 100 * (weights["employment"] / 100)
    else:
        score += 30 * (weights["employment"] / 100)

    # Bank relationship
    user_banks = user_profile.get("bank_accounts", [])
    card_bank = card["bank_name"].lower().replace(" ", "_")
    parent_required = card["eligibility"].get("parent_bank_required", False)

    if any(card_bank in b.lower() for b in user_banks):
        score += 100 * (weights["bank_relationship"] / 100)
    elif not parent_required:
        score += 60 * (weights["bank_relationship"] / 100)
    else:
        score += 10 * (weights["bank_relationship"] / 100)

    # Age (assume 25 if not provided)
    score += 100 * (weights["age"] / 100)

    # Invite-only gate (FIX 10): cap at 20 if income < ₹20L
    if card["eligibility"].get("invite_only"):
        if user_income < 2000000:
            score = min(score, 20)

    return round(min(score, 100), 2)

def score_fit_layer(card, user_profile, intent_data, rupee_value, user_spend=None):
    fit_config = load_config("fit_weights.json")
    primary_intent = intent_data["primary"]

    weights = fit_config["dynamic_shifts"].get(
        primary_intent, fit_config["base_weights"]
    )

    scores = {}

    # Annual fee alignment (FIX 7 — waiver-aware soft gate)
    fee_pref = user_profile.get("fee_preference", "up_to_1000")
    annual_fee = card["fees"]["annual_fee"]
    is_ltf = card["fees"].get("is_lifetime_free", False)
    waiver_thresh = card["fees"].get("annual_fee_waiver_threshold", 0)

    # Determine the fee preference upper limit in rupees
    pref_limit_map = {
        "zero_only": 0,
        "up_to_1000": 1000,
        "up_to_5000": 5000,
        "fee_doesnt_matter": 999999,
    }
    pref_limit = pref_limit_map.get(fee_pref, 1000)
    effective_fee = 0 if is_ltf else annual_fee

    if effective_fee == 0 or is_ltf:
        scores["annual_fee_alignment"] = 100
    elif fee_pref == "zero_only":
        # Near-eliminate cards with fees
        scores["annual_fee_alignment"] = max(0, 10 - (annual_fee / 500))
    elif effective_fee <= pref_limit:
        scores["annual_fee_alignment"] = 100
    elif waiver_thresh and waiver_thresh > 0:
        # Card has waiver — score 75 if user might hit it
        scores["annual_fee_alignment"] = 75
    elif effective_fee <= pref_limit * 2:
        scores["annual_fee_alignment"] = 40
    else:
        # Card fee is >2x the preference limit — near-eliminate
        scores["annual_fee_alignment"] = max(5, 30 - (effective_fee - pref_limit * 2) / 1000)

    # Reward rate match (FIX 12 — % of annual spend)
    _s = user_spend or {}
    total_annual_spend = sum([
        _s.get(f"{k}_spend", 0)
        for k in ["food_delivery","groceries","dining","online_shopping","fuel",
                  "upi","travel","entertainment","pharmacy","international",
                  "rent","education","tax","insurance","emi"]
    ]) * 12

    annual_value = rupee_value["total"]
    if total_annual_spend > 0:
        reward_pct = (annual_value / total_annual_spend) * 100
    else:
        reward_pct = 0

    if reward_pct >= 4:
        scores["reward_rate_match"] = 100
    elif reward_pct >= 3:
        scores["reward_rate_match"] = 85
    elif reward_pct >= 2:
        scores["reward_rate_match"] = 70
    elif reward_pct >= 1:
        scores["reward_rate_match"] = 50
    elif reward_pct >= 0.5:
        scores["reward_rate_match"] = 30
    else:
        scores["reward_rate_match"] = 10

    # Welcome bonus value
    welcome_points = card["rewards"].get("welcome_bonus_points", 0) or 0
    pv_dict = card["rewards"].get("point_value", {})
    numeric_pv = [v for v in pv_dict.values() if isinstance(v, (int, float))]
    best_pv = max(numeric_pv) if numeric_pv else 0.25
    welcome_value = (welcome_points * best_pv) / 3  # amortized
    if welcome_value > 5000:
        scores["welcome_bonus_value"] = 100
    elif welcome_value > 2000:
        scores["welcome_bonus_value"] = 70
    elif welcome_value > 500:
        scores["welcome_bonus_value"] = 40
    else:
        scores["welcome_bonus_value"] = 10

    # Travel benefits depth
    domestic_lounge = card.get("travel_benefits", {}).get(
        "domestic_lounge", {}
    ).get("visits_per_quarter", 0) or 0
    intl_lounge = card.get("travel_benefits", {}).get(
        "international_lounge", {}
    ).get("visits_per_year", 0) or 0
    travel_insurance = card.get("travel_benefits", {}).get(
        "travel_insurance", {}
    ).get("air_accident_cover", 0) or 0

    travel_score = 0
    if domestic_lounge >= 4:
        travel_score += 40
    elif domestic_lounge >= 2:
        travel_score += 25
    elif domestic_lounge >= 1:
        travel_score += 10
    if intl_lounge >= 6:
        travel_score += 30
    elif intl_lounge >= 2:
        travel_score += 15
    if travel_insurance > 0:
        travel_score += 30
    scores["travel_benefits_depth"] = min(travel_score, 100)

    # Lounge access match
    lounge_needed_map = {
        "0": 0, "1_2": 1, "3_4": 3, "unlimited": 8
    }
    lounge_needed = lounge_needed_map.get(
        user_profile.get("lounge_visits_needed", "0"), 0
    )
    if lounge_needed == 0:
        scores["lounge_access"] = 70
    elif domestic_lounge >= lounge_needed:
        scores["lounge_access"] = 100
    elif domestic_lounge >= lounge_needed - 1:
        scores["lounge_access"] = 60
    else:
        scores["lounge_access"] = 20

    # Cashback structure
    reward_type = card["rewards"].get("reward_type", "points")
    user_pref = user_profile.get("card_preference", "reward_points")
    if reward_type == "cashback" and user_pref == "cashback":
        scores["cashback_structure"] = 100
    elif reward_type == "cashback":
        scores["cashback_structure"] = 60
    elif user_pref == "cashback":
        scores["cashback_structure"] = 40
    else:
        scores["cashback_structure"] = 70

    # Additional perks
    perks_score = 0
    lifestyle = card.get("lifestyle_benefits", {})
    if lifestyle.get("golf", {}).get("available") and user_profile.get("golf"):
        perks_score += 30
    if lifestyle.get("movies", {}).get("free_tickets_per_month", 0) > 0:
        perks_score += 20
    if lifestyle.get("concierge") and user_profile.get("concierge"):
        perks_score += 25
    if lifestyle.get("ott_subscriptions"):
        perks_score += 15
    if lifestyle.get("dining_program", {}).get("program"):
        perks_score += 10
    scores["additional_perks"] = min(perks_score, 100)

    # Bank relationship
    user_banks = user_profile.get("bank_accounts", [])
    card_bank = card["bank_name"].lower()
    if any(card_bank in b.lower() for b in user_banks):
        scores["bank_relationship"] = 100
    else:
        scores["bank_relationship"] = 50

    # Network preference
    scores["network_preference"] = 70

    # Digital experience
    digital = card.get("digital", {})
    digital_score = 0
    if digital.get("upi_credit_card"):
        digital_score += 40
    if digital.get("google_pay"):
        digital_score += 20
    if digital.get("no_cost_emi"):
        digital_score += 20
    if digital.get("virtual_card"):
        digital_score += 20
    scores["digital_experience"] = min(digital_score, 100)

    # UPI boost (FIX 9)
    _spend = user_spend or {}
    total_spend_mid = sum([
        _spend.get(f"{k}_spend", 0)
        for k in ["food_delivery","groceries","dining","online_shopping","fuel",
                  "upi","travel","entertainment","pharmacy","international"]
    ])
    upi_spend = _spend.get("upi_spend", 0)
    if total_spend_mid > 0 and digital.get("upi_credit_card"):
        upi_ratio = upi_spend / total_spend_mid
        if upi_ratio > 0.40:
            scores["digital_experience"] = min(scores["digital_experience"] + 15, 100)
        elif upi_ratio > 0.25:
            scores["digital_experience"] = min(scores["digital_experience"] + 10, 100)
        elif upi_ratio > 0.10:
            scores["digital_experience"] = min(scores["digital_experience"] + 5, 100)

    # Calculate weighted fit score
    total_fit_score = 0
    for attr, weight in weights.items():
        attr_score = scores.get(attr, 50)
        total_fit_score += attr_score * (weight / 100)

    return round(total_fit_score, 2)

def score_competitive_layer(card, all_cards, top_cards_so_far):
    competes_with = card.get("engine_meta", {}).get(
        "competes_with", []
    )
    complementary = card.get("engine_meta", {}).get(
        "complementary_cards", []
    )

    score = 50

    top_ids = [c["card_id"] for c in top_cards_so_far[:3]]

    for top_id in top_ids:
        if top_id in complementary:
            score += 25
        if top_id in competes_with:
            score -= 15

    return round(min(max(score, 0), 100), 2)

def rank_cards(user_profile, user_spend):
    from engine.intent import detect_intent

    scoring_cfg = load_config("scoring_functions.json")
    lw = scoring_cfg["layer_weights"]

    print("RECEIVED PROFILE:", user_profile)
    print("RECEIVED SPEND:", user_spend)

    survey_combined = {**user_profile, **user_spend}
    survey_combined["total_spend_midpoint"] = get_total_spend_midpoint(
        user_spend.get("total_spend_range", "20_40K")
    )

    intent_data = detect_intent(survey_combined)
    print("DETECTED INTENT:", intent_data)
    cards = load_cards()

    results = []

    for card in cards:
        try:
            rupee_value = calculate_annual_rupee_value(card, user_spend)
            intent_score = score_intent_layer(card, intent_data)
            eligibility_score = score_eligibility_layer(card, user_profile)
            fit_score = score_fit_layer(
                card, user_profile, intent_data, rupee_value, user_spend
            )

            results.append({
                "card": card,
                "rupee_value": rupee_value,
                "scores": {
                    "intent": intent_score,
                    "fit": fit_score,
                    "eligibility": eligibility_score,
                    "competitive": 50
                }
            })
        except Exception:
            card_id = card.get("card_id", "unknown")
            print(f"[scorer] ERROR scoring card '{card_id}':")
            traceback.print_exc()

    # Compute normalized rupee_value_score (FIX 8)
    all_rupee = [r["rupee_value"]["total"] for r in results]
    max_rupee = max(all_rupee) if all_rupee else 1
    min_rupee = min(all_rupee) if all_rupee else 0
    rupee_range = max_rupee - min_rupee if max_rupee != min_rupee else 1

    for result in results:
        raw = result["rupee_value"]["total"]
        result["rupee_value_score"] = round(
            max(0, min(100, ((raw - min_rupee) / rupee_range) * 100)), 2
        )

    results.sort(
        key=lambda x: (
            x["scores"]["intent"] * lw["intent"] +
            x["scores"]["fit"] * lw["fit"] +
            x["scores"]["eligibility"] * lw["eligibility"] +
            x["rupee_value_score"] * lw.get("rupee_value", 0) +
            x["scores"]["competitive"] * lw["competitive"]
        ),
        reverse=True
    )

    # Add competitive scores now that we have ranking
    for i, result in enumerate(results):
        top_so_far = [r["card"] for r in results[:i]]
        competitive = score_competitive_layer(
            result["card"], cards, top_so_far
        )
        result["scores"]["competitive"] = competitive

    # Recalculate final scores with competitive + rupee_value
    for result in results:
        s = result["scores"]
        result["final_score"] = round(
            s["intent"] * lw["intent"] +
            s["fit"] * lw["fit"] +
            s["eligibility"] * lw["eligibility"] +
            result["rupee_value_score"] * lw.get("rupee_value", 0) +
            s["competitive"] * lw["competitive"],
            2
        )

    results.sort(key=lambda x: x["final_score"], reverse=True)

    return {
        "intent": intent_data,
        "ranked_cards": results[:5]
    }
