import json
import os

DOMINANT_SIGNAL_INTENT_BOOST = {
    "upi":      {"cashback": 25, "maximize_rewards": 10},
    "travel":   {"travel": 30, "premium_lifestyle": 10},
    "food":     {"cashback": 20, "maximize_rewards": 10},
    "shopping": {"cashback": 15, "maximize_rewards": 15},
    "fuel":     {"cashback": 25},
}

_DOMINANT_SPEND_KEYS = {
    "upi":      "upi_spend",
    "travel":   "travel_spend",
    "food":     "food_delivery_spend",
    "shopping": "online_shopping_spend",
    "fuel":     "fuel_spend",
}

DOMINANT_THRESHOLD = 0.35


def detect_dominant_signal(user_spend):
    """
    Computes the ratio of each tracked category to total spend.
    Returns (signal_name, ratio) if any category >= DOMINANT_THRESHOLD, else (None, 0).
    """
    all_keys = [
        "food_delivery_spend", "groceries_spend", "dining_spend",
        "online_shopping_spend", "fuel_spend", "upi_spend", "travel_spend",
        "entertainment_spend", "pharmacy_spend", "international_spend",
        "emi_spend", "rent_spend", "education_spend", "tax_spend", "insurance_spend"
    ]
    total = sum(user_spend.get(k, 0) for k in all_keys)
    if total == 0:
        return (None, 0)

    best_signal = None
    best_ratio = 0.0

    for signal, key in _DOMINANT_SPEND_KEYS.items():
        ratio = user_spend.get(key, 0) / total
        if ratio > best_ratio:
            best_ratio = ratio
            best_signal = signal

    if best_ratio >= DOMINANT_THRESHOLD:
        return (best_signal, round(best_ratio, 4))
    return (None, 0)


def detect_intent(survey_data):
    scores = {
        "travel": 0,
        "cashback": 0,
        "maximize_rewards": 0,
        "premium_lifestyle": 0,
        "low_interest": 0,
        "business": 0,
        "build_credit": 0
    }

    # LAYER 1 SIGNALS
    income = survey_data.get("income", "")
    employment = survey_data.get("employment", "")
    existing_cards = survey_data.get("existing_cards", 0)
    credit_score = survey_data.get("credit_score", "")
    fee_preference = survey_data.get("fee_preference", "")

    if employment == "student":
        scores["build_credit"] += 30
        scores["low_interest"] += 20

    if employment == "business_owner":
        scores["business"] += 25
        scores["maximize_rewards"] += 10

    if income in ["above_25L"]:
        scores["premium_lifestyle"] += 25
        scores["maximize_rewards"] += 15

    if income in ["10_25L"]:
        scores["maximize_rewards"] += 15
        scores["travel"] += 10

    if income in ["below_3L", "3_6L"]:
        scores["build_credit"] += 20
        scores["low_interest"] += 15
        scores["cashback"] += 15

    if existing_cards == 0:
        scores["build_credit"] += 20

    if credit_score in ["below_650", "650_700"]:
        scores["build_credit"] += 25
        scores["low_interest"] += 10

    if fee_preference == "zero_only":
        scores["build_credit"] += 10
        scores["cashback"] += 5
        scores["low_interest"] += 10

    if fee_preference == "fee_doesnt_matter":
        scores["premium_lifestyle"] += 15
        scores["travel"] += 10

    # LAYER 2 SIGNALS
    total_spend = survey_data.get("total_spend_midpoint", 20000)
    travel_spend = survey_data.get("travel_spend", 0)
    food_spend = survey_data.get("food_delivery_spend", 0)
    shopping_spend = survey_data.get("online_shopping_spend", 0)
    fuel_spend = survey_data.get("fuel_spend", 0)
    upi_spend = survey_data.get("upi_spend", 0)
    international_spend = survey_data.get("international_spend", 0)

    if total_spend > 0:
        if travel_spend / total_spend > 0.25:
            scores["travel"] += 30
            scores["premium_lifestyle"] += 10
        if food_spend / total_spend > 0.20:
            scores["cashback"] += 20
            scores["maximize_rewards"] += 10
        if shopping_spend / total_spend > 0.25:
            scores["cashback"] += 15
            scores["maximize_rewards"] += 15
        if fuel_spend / total_spend > 0.15:
            scores["cashback"] += 20
        if upi_spend / total_spend > 0.30:
            scores["cashback"] += 15
            scores["maximize_rewards"] += 10
        if international_spend / total_spend > 0.15:
            scores["travel"] += 20
            scores["premium_lifestyle"] += 10

    # LAYER 3 SIGNALS
    domestic_flights = survey_data.get("domestic_flights", "0")
    international_flights = survey_data.get("international_flights", "0")
    lounge_needed = survey_data.get("lounge_visits_needed", "0")
    card_preference = survey_data.get("card_preference", "")
    concierge = survey_data.get("concierge", False)
    golf = survey_data.get("golf", False)

    if domestic_flights in ["4_8", "9_plus"]:
        scores["travel"] += 20
    if domestic_flights in ["1_3"]:
        scores["travel"] += 10

    if international_flights in ["3_5", "5_plus"]:
        scores["travel"] += 25
        scores["premium_lifestyle"] += 15
    if international_flights in ["1_2"]:
        scores["travel"] += 15

    if lounge_needed in ["3_4", "unlimited"]:
        scores["travel"] += 20
        scores["premium_lifestyle"] += 15
    if lounge_needed in ["1_2"]:
        scores["travel"] += 10

    if card_preference == "cashback":
        scores["cashback"] += 30
    if card_preference == "reward_points":
        scores["maximize_rewards"] += 30
    if card_preference == "travel_miles":
        scores["travel"] += 30

    if concierge:
        scores["premium_lifestyle"] += 20

    if golf:
        scores["premium_lifestyle"] += 15

    # DOMINANT SIGNAL BOOST
    # Use raw spend values from survey_data (keys like "upi_spend")
    dominant_signal, dominant_ratio = detect_dominant_signal(survey_data)
    if dominant_signal and dominant_ratio > 0:
        scale = dominant_ratio / DOMINANT_THRESHOLD
        boosts = DOMINANT_SIGNAL_INTENT_BOOST.get(dominant_signal, {})
        for intent_key, base_boost in boosts.items():
            scores[intent_key] = scores.get(intent_key, 0) + round(base_boost * scale)

    sorted_intents = sorted(
        scores.items(), key=lambda x: x[1], reverse=True
    )

    return {
        "primary": sorted_intents[0][0],
        "secondary": sorted_intents[1][0],
        "all_scores": dict(scores),
        "dominant_signal": dominant_signal,
        "dominant_ratio": dominant_ratio
    }
