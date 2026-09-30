"""
Finoptima Backtest Harness — 5 test cases, in-process (no HTTP).
Run from backend/ directory: python tests/backtest.py
"""
import sys
import os

# Ensure backend/ is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Windows console UTF-8 support
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from engine.scorer import rank_cards

# ---------------------------------------------------------------------------
# Test case definitions
# ---------------------------------------------------------------------------

T1 = {
    "name": "T1 Student Zero Fee",
    "profile": {
        "income": "3_6L",
        "employment": "student",
        "credit_score": "dont_know",
        "fee_preference": "zero_only",
        "bank_accounts": ["State Bank of India", "Kotak Mahindra Bank"],
        "existing_cards": 0,
        "total_spend_range": "under_10K",
        "lounge_visits_needed": "0",
        "card_preference": "cashback",
        "concierge": False,
        "golf": False,
        "domestic_flights": "0",
        "international_flights": "0"
    },
    "spend": {
        "total_spend_range": "under_10K",
        "food_delivery_spend": 500,
        "groceries_spend": 500,
        "dining_spend": 0,
        "online_shopping_spend": 1000,
        "fuel_spend": 0,
        "upi_spend": 2000,
        "travel_spend": 0,
        "entertainment_spend": 0,
        "pharmacy_spend": 0,
        "international_spend": 0,
        "emi_spend": 0,
        "rent_spend": 0,
        "education_spend": 0,
        "tax_spend": 0,
        "insurance_spend": 0
    },
    "rules": [
        {"type": "all_zero_fee",    "top_n": 5},
        {"type": "intent_in",       "values": ["build_credit", "cashback"]},
    ]
}

T2 = {
    "name": "T2 Premium Traveler",
    "profile": {
        "income": "above_25L",
        "employment": "self_employed",
        "credit_score": "above_800",
        "fee_preference": "fee_doesnt_matter",
        "bank_accounts": ["HDFC Bank", "ICICI Bank"],
        "existing_cards": 3,
        "total_spend_range": "75K_plus",
        "lounge_visits_needed": "unlimited",
        "card_preference": "travel_miles",
        "concierge": True,
        "golf": True,
        "domestic_flights": "9_plus",
        "international_flights": "3_5"
    },
    "spend": {
        "total_spend_range": "75K_plus",
        "food_delivery_spend": 5000,
        "groceries_spend": 2000,
        "dining_spend": 8000,
        "online_shopping_spend": 10000,
        "fuel_spend": 2000,
        "upi_spend": 3000,
        "travel_spend": 30000,
        "entertainment_spend": 2000,
        "pharmacy_spend": 1000,
        "international_spend": 15000,
        "emi_spend": 0,
        "rent_spend": 0,
        "education_spend": 0,
        "tax_spend": 0,
        "insurance_spend": 0
    },
    "rules": [
        {"type": "intent_in",          "values": ["travel", "premium_lifestyle"]},
        {"type": "dominant_signal_in", "values": ["travel"]},
        {"type": "min_reward_rank1",   "min_value": 5000},
    ]
}

T3 = {
    "name": "T3 UPI Heavy Digital",
    "profile": {
        "income": "6_10L",
        "employment": "salaried",
        "credit_score": "700_750",
        "fee_preference": "up_to_1000",
        "bank_accounts": ["Axis Bank", "IDFC FIRST Bank"],
        "existing_cards": 1,
        "total_spend_range": "10_20K",
        "lounge_visits_needed": "0",
        "card_preference": "cashback",
        "concierge": False,
        "golf": False,
        "domestic_flights": "0",
        "international_flights": "0"
    },
    "spend": {
        "total_spend_range": "10_20K",
        "food_delivery_spend": 500,
        "groceries_spend": 500,
        "dining_spend": 0,
        "online_shopping_spend": 1000,
        "fuel_spend": 0,
        "upi_spend": 8000,
        "travel_spend": 0,
        "entertainment_spend": 0,
        "pharmacy_spend": 0,
        "international_spend": 0,
        "emi_spend": 0,
        "rent_spend": 0,
        "education_spend": 0,
        "tax_spend": 0,
        "insurance_spend": 0
    },
    "rules": [
        {"type": "intent_in",          "values": ["cashback", "maximize_rewards"]},
        {"type": "dominant_signal_in", "values": ["upi"]},
        {"type": "max_fee_top3",       "max_fee": 1000},
    ]
}

T4 = {
    "name": "T4 Fuel Heavy Driver",
    "profile": {
        "income": "6_10L",
        "employment": "salaried",
        "credit_score": "700_750",
        "fee_preference": "up_to_1000",
        "bank_accounts": ["HDFC Bank"],
        "existing_cards": 1,
        "total_spend_range": "20_40K",
        "lounge_visits_needed": "0",
        "card_preference": "cashback",
        "concierge": False,
        "golf": False,
        "domestic_flights": "0",
        "international_flights": "0"
    },
    "spend": {
        "total_spend_range": "20_40K",
        "food_delivery_spend": 2000,
        "groceries_spend": 2000,
        "dining_spend": 0,
        "online_shopping_spend": 3000,
        "fuel_spend": 15000,
        "upi_spend": 0,
        "travel_spend": 0,
        "entertainment_spend": 0,
        "pharmacy_spend": 0,
        "international_spend": 0,
        "emi_spend": 0,
        "rent_spend": 0,
        "education_spend": 0,
        "tax_spend": 0,
        "insurance_spend": 0
    },
    "rules": [
        {"type": "intent_in",          "values": ["cashback"]},
        {"type": "dominant_signal_in", "values": ["fuel"]},
        {"type": "max_fee_top3",       "max_fee": 1000},
    ]
}

T5 = {
    "name": "T5 Balanced Mid Income",
    "profile": {
        "income": "10_25L",
        "employment": "salaried",
        "credit_score": "750_800",
        "fee_preference": "up_to_5000",
        "bank_accounts": ["HDFC Bank", "ICICI Bank"],
        "existing_cards": 2,
        "total_spend_range": "40_75K",
        "lounge_visits_needed": "1_2",
        "card_preference": "reward_points",
        "concierge": False,
        "golf": False,
        "domestic_flights": "1_3",
        "international_flights": "0"
    },
    "spend": {
        "total_spend_range": "40_75K",
        "food_delivery_spend": 3000,
        "groceries_spend": 4000,
        "dining_spend": 5000,
        "online_shopping_spend": 10000,
        "fuel_spend": 3000,
        "upi_spend": 5000,
        "travel_spend": 10000,
        "entertainment_spend": 2000,
        "pharmacy_spend": 2000,
        "international_spend": 0,
        "emi_spend": 5000,
        "rent_spend": 0,
        "education_spend": 0,
        "tax_spend": 0,
        "insurance_spend": 0
    },
    "rules": [
        {"type": "intent_in",        "values": ["maximize_rewards", "travel"]},
        {"type": "max_fee_top5",     "max_fee": 5000},
        {"type": "min_reward_rank1", "min_value": 3000},
    ]
}

ALL_TESTS = [T1, T2, T3, T4, T5]

# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate(rule, recs, intent_result):
    rule_type = rule["type"]

    def _effective_fee(r):
        ef = r.get("effective_fee")
        if ef is None:
            fee = r.get("annual_fee", 0) or 0
            ltf = r.get("is_lifetime_free", False)
            ef = 0 if ltf else fee
        return ef

    if rule_type == "all_zero_fee":
        top_n = rule.get("top_n", 5)
        failed = [r for r in recs[:top_n] if _effective_fee(r) > 0]
        if failed:
            names = ", ".join(r["card_name"] for r in failed)
            return False, f"Non-zero effective fee cards in top {top_n}: {names}"
        return True, f"All top {top_n} cards are zero effective fee"

    elif rule_type == "max_fee_top3":
        max_fee = rule["max_fee"]
        failed = [r for r in recs[:3] if _effective_fee(r) > max_fee]
        if failed:
            names = ", ".join(
                f"{r['card_name']} (eff=₹{_effective_fee(r)}, listed=₹{r['annual_fee']})"
                for r in failed
            )
            return False, f"Cards in top 3 exceed ₹{max_fee} effective fee: {names}"
        return True, f"All top 3 cards have effective fee ≤ ₹{max_fee}"

    elif rule_type == "max_fee_top5":
        max_fee = rule["max_fee"]
        failed = [r for r in recs[:5] if _effective_fee(r) > max_fee]
        if failed:
            names = ", ".join(
                f"{r['card_name']} (eff=₹{_effective_fee(r)}, listed=₹{r['annual_fee']})"
                for r in failed
            )
            return False, f"Cards in top 5 exceed ₹{max_fee} effective fee: {names}"
        return True, f"All top 5 cards have effective fee ≤ ₹{max_fee}"

    elif rule_type == "intent_in":
        primary = intent_result["primary"]
        values = rule["values"]
        if primary in values:
            return True, f"Detected intent '{primary}' in {values}"
        return False, f"Detected intent '{primary}' not in expected {values}"

    elif rule_type == "dominant_signal_in":
        signal = intent_result.get("dominant_signal")
        values = rule["values"]
        if signal in values:
            return True, f"Dominant signal '{signal}' in {values}"
        return False, f"Dominant signal '{signal}' not in expected {values}"

    elif rule_type == "min_reward_rank1":
        min_val = rule["min_value"]
        if not recs:
            return False, "No recommendations returned"
        top_reward = recs[0]["estimated_annual_reward"]
        if top_reward >= min_val:
            return True, f"Rank 1 reward ₹{top_reward:,.0f} ≥ ₹{min_val:,}"
        return False, f"Rank 1 reward ₹{top_reward:,.0f} < expected ₹{min_val:,}"

    return False, f"Unknown rule type: {rule_type}"


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

def run_test(test):
    name = test["name"]
    print(f"\n{'='*55}")
    print(f"  {name}")
    print(f"{'='*55}")

    result = rank_cards(test["profile"], test["spend"])
    intent = result["intent"]
    recs = []

    for item in result["ranked_cards"]:
        card = item["card"]
        annual_fee = card.get("fees", {}).get("annual_fee", 0) or 0
        waiver = card.get("fees", {}).get("annual_fee_waiver_threshold")
        is_ltf = card.get("fees", {}).get("is_lifetime_free", False)

        annual_spend = sum([
            item["rupee_value"].get("breakdown", {}).get(
                k, {}
            ).get("monthly_spend", 0) or 0
            for k in item["rupee_value"].get("breakdown", {})
        ]) * 12

        fee_waived = (
            is_ltf or
            annual_fee == 0 or
            (waiver and isinstance(waiver, (int, float))
             and annual_spend >= waiver)
        )

        recs.append({
            "card_name": card["card_name"],
            "bank_name": card["bank_name"],
            "annual_fee": annual_fee,
            "is_lifetime_free": is_ltf,
            "effective_fee": 0 if fee_waived else annual_fee,
            "fee_waived": fee_waived,
            "fee_waiver_threshold": waiver,
            "estimated_annual_reward": item["rupee_value"]["total"],
            "final_score": item["final_score"],
            "rupee_value_score": item.get("rupee_value_score", 0),
            "score_breakdown": item["scores"],
        })

    print(f"  Detected intent : {intent['primary']}")
    print(f"  Secondary intent: {intent['secondary']}")
    print(f"  Dominant signal : {intent.get('dominant_signal')} "
          f"(ratio={intent.get('dominant_ratio', 0):.2%})")
    print()

    for i, card in enumerate(recs):
        s = card["score_breakdown"]
        print(f"  #{i+1} {card['card_name']}")
        eff = card["effective_fee"]
        waived_tag = " [waived]" if card["fee_waived"] and card["annual_fee"] > 0 else ""
        print(f"      Bank: {card['bank_name']} | "
              f"Listed: ₹{card['annual_fee']} | Eff: ₹{eff}{waived_tag}")
        print(f"      Est Reward: ₹{card['estimated_annual_reward']:,.0f} | "
              f"Final: {card['final_score']}")
        print(f"      Intent={s['intent']} Fit={s['fit']} "
              f"Elig={s['eligibility']} RV={card['rupee_value_score']}")

    print()
    passed_count = 0
    for rule in test["rules"]:
        ok, msg = validate(rule, recs, intent)
        status = "PASS" if ok else "FAIL"
        print(f"  [{status}] {msg}")
        if ok:
            passed_count += 1

    return passed_count == len(test["rules"])


def main():
    total = len(ALL_TESTS)
    passed = 0

    for test in ALL_TESTS:
        try:
            ok = run_test(test)
            if ok:
                passed += 1
        except Exception as e:
            import traceback
            print(f"\n[ERROR] {test['name']} crashed: {e}")
            traceback.print_exc()

    print(f"\n{'='*55}")
    print(f"  RESULT: {passed}/{total} tests passed")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    main()
