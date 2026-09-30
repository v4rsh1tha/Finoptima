def generate_reasons(card, user_profile, rupee_value, scores):
    reasons = []
    breakdown = rupee_value.get("breakdown", {})

    # Top earning category reason
    if breakdown:
        top_cat = max(breakdown.items(), key=lambda x: x[1]["annual_value"])
        cat_name = top_cat[0].replace("_", " ").title()
        cat_data = top_cat[1]
        reasons.append(
            f"Your \u20b9{cat_data['monthly_spend']:,}/month on {cat_name} "
            f"earns approx \u20b9{int(cat_data['annual_value']):,}/year"
        )

    # Lounge match reason
    lounge_needed_map = {"0": 0, "1_2": 1, "3_4": 3, "unlimited": 8}
    lounge_needed = lounge_needed_map.get(
        user_profile.get("lounge_visits_needed", "0"), 0
    )
    domestic_lounge = card.get("travel_benefits", {}).get(
        "domestic_lounge", {}
    ).get("visits_per_quarter", 0) or 0

    if lounge_needed > 0 and domestic_lounge >= lounge_needed:
        reasons.append(
            f"Provides {domestic_lounge} quarterly lounge visits "
            f"\u2014 matches your requirement"
        )

    # Fee justification
    annual_fee = card["fees"]["annual_fee"]
    total_value = rupee_value["total"]
    is_ltf = card["fees"].get("is_lifetime_free", False)

    if is_ltf:
        reasons.append("Lifetime free card \u2014 zero annual fee")
    elif total_value > annual_fee * 2:
        reasons.append(
            f"Annual fee \u20b9{annual_fee:,} is well justified \u2014 "
            f"estimated reward value \u20b9{int(total_value):,}/year"
        )

    # Lifestyle match
    lifestyle = card.get("lifestyle_benefits", {})
    if lifestyle.get("golf", {}).get("available") and user_profile.get("golf"):
        rounds = lifestyle["golf"].get("free_rounds_per_month", 0)
        reasons.append(f"Includes {rounds} free golf rounds per month")

    if lifestyle.get("concierge") and user_profile.get("concierge"):
        reasons.append("24/7 concierge service included")

    # Score explanation
    reasons.append(
        f"Match score: Intent {scores['intent']:.0f}/100 \u00b7 "
        f"Fit {scores['fit']:.0f}/100 \u00b7 "
        f"Eligibility {scores['eligibility']:.0f}/100"
    )

    return reasons[:4]
