from flask import Flask, request, jsonify
from flask_cors import CORS
from engine.scorer import rank_cards
from engine.explainer import generate_reasons

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://finoptima.vercel.app",
    "*"
])
@app.route("/api/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        user_profile = data.get("profile", {})
        user_spend = data.get("spend", {})

        result = rank_cards(user_profile, user_spend)
        intent = result["intent"]
        ranked = result["ranked_cards"]

        response_cards = []
        for item in ranked:
            card = item["card"]
            rupee_value = item["rupee_value"]
            scores = item["scores"]

            reasons = generate_reasons(
                card, user_profile, rupee_value, scores
            )

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

            effective_fee = 0 if fee_waived else annual_fee

            # Extract benefit flags for frontend tags
            rewards = card.get("rewards", {})
            cat_rates = card.get("category_rates", {})
            travel = card.get("travel_benefits", {})
            lifestyle = card.get("lifestyle_benefits", {})
            digital = card.get("digital", {})
            base_rate = rewards.get("base_earn_rate", 0) or 0

            lounge_dom = travel.get("domestic_lounge", {})
            lounge_intl = travel.get("international_lounge", {})
            lounge_visits = (
                (lounge_dom.get("visits_per_quarter", 0) or 0) +
                (lounge_intl.get("visits_per_quarter", 0) or 0)
            )

            benefit_flags = {
                "welcome_bonus": bool(rewards.get("welcome_bonus_points", 0)),
                "travel": bool(lounge_dom) or "travel" in str(card.get("engine_meta", {}).get("best_for_profile", [])).lower(),
                "lounge": lounge_visits > 0,
                "fuel": (cat_rates.get("fuel", {}).get("rate", 0) or 0) > base_rate,
                "dining": bool(lifestyle.get("dining_program")),
                "shopping": (cat_rates.get("online_shopping", {}).get("rate", 0) or 0) > base_rate,
                "upi": bool(digital.get("upi_credit_card")),
                "cashback": "cashback" in card.get("card_name", "").lower() or rewards.get("reward_type") == "cashback",
            }

            response_cards.append({
                "card_id": card["card_id"],
                "card_name": card["card_name"],
                "bank_name": card["bank_name"],
                "network": card["network"],
                "annual_fee": annual_fee,
                "joining_fee": card["fees"].get("joining_fee", annual_fee),
                "is_lifetime_free": is_ltf,
                "effective_fee": effective_fee,
                "fee_waived": fee_waived,
                "fee_waiver_threshold": waiver,
                "estimated_annual_reward": rupee_value["total"],
                "final_score": item["final_score"],
                "score_breakdown": scores,
                "rupee_value_score": item.get("rupee_value_score", 0),
                "reasons": reasons,
                "card_tier": card.get("card_tier", "mid"),
                "best_for": card.get("engine_meta", {}).get(
                    "best_for_profile", []
                ),
                "benefit_flags": benefit_flags,
                "reward_rate": f"{base_rate}x" if base_rate else "1x",
                "rupee_breakdown": rupee_value.get("breakdown", {}),
            })

        return jsonify({
            "success": True,
            "detected_intent": intent["primary"],
            "secondary_intent": intent["secondary"],
            "dominant_signal": intent.get("dominant_signal"),
            "dominant_ratio": intent.get("dominant_ratio", 0),
            "recommendations": response_cards
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Finoptima engine running"})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)