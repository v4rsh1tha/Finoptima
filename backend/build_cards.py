"""
Rebuild complete cards_data.json from all available sources with all engine fixes applied.
Generates ~45 cards combining:
  - 10-card base JSON (from prior session)
  - 9 unique cards parsed from data/data 1.txt (UTF-16 LE)
  - ~26 additional cards built from known card data
"""
import json, re, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

# ── Helpers ───────────────────────────────────────────────────────────────

def card(
    card_id, card_name, bank_name, network, card_tier,
    annual_fee, joining_fee=None, is_lifetime_free=False,
    fee_waiver_threshold=0, forex_markup=3.5,
    min_credit_score=700, min_income_sal=600000, min_income_se=600000,
    eligible_employment=None, parent_bank_required=False,
    reward_type="points", base_earn_rate=1.0, point_value=None,
    welcome_bonus_points=0, milestones=None,
    category_rates=None,
    domestic_lounge_q=0, domestic_lounge_y=None,
    intl_lounge_y=0, air_accident_cover=0,
    golf=False, concierge=False, movies=0, ott=False, dining_program=None,
    upi_credit_card=False, google_pay=True, no_cost_emi=True, virtual_card=True,
    best_for_profile=None, competes_with=None, complementary_cards=None,
    invite_only=False,
):
    if eligible_employment is None:
        eligible_employment = ["salaried", "self_employed", "business_owner"]
    if point_value is None:
        point_value = {"cashback": 0.25}
    if milestones is None:
        milestones = []
    if category_rates is None:
        category_rates = {}
    if best_for_profile is None:
        best_for_profile = ["maximize_rewards"]
    if competes_with is None:
        competes_with = []
    if complementary_cards is None:
        complementary_cards = []

    fees = {
        "annual_fee": annual_fee,
        "is_lifetime_free": is_lifetime_free,
    }
    if joining_fee is not None:
        fees["joining_fee"] = joining_fee
    if fee_waiver_threshold:
        fees["annual_fee_waiver_threshold"] = fee_waiver_threshold
    if forex_markup:
        fees["forex_markup_pct"] = forex_markup

    dl_obj = {}
    if domestic_lounge_q:
        dl_obj["visits_per_quarter"] = domestic_lounge_q
    if domestic_lounge_y is not None:
        dl_obj["visits_per_year"] = domestic_lounge_y

    travel = {
        "domestic_lounge": dl_obj,
        "international_lounge": {"visits_per_year": intl_lounge_y},
        "travel_insurance": {"air_accident_cover": air_accident_cover},
    }

    lifestyle = {
        "golf": {"available": golf, "free_rounds_per_month": 2 if golf else 0},
        "movies": {"free_tickets_per_month": movies},
        "concierge": concierge,
        "ott_subscriptions": ott,
        "dining_program": {"program": dining_program} if dining_program else {},
    }

    elig = {
        "min_credit_score": min_credit_score,
        "min_income_salaried": min_income_sal,
        "min_income_self_employed": min_income_se,
        "eligible_employment": eligible_employment,
        "parent_bank_required": parent_bank_required,
    }
    if invite_only:
        elig["invite_only"] = True

    return {
        "card_id": card_id,
        "card_name": card_name,
        "bank_name": bank_name,
        "network": network,
        "card_tier": card_tier,
        "fees": fees,
        "eligibility": elig,
        "rewards": {
            "reward_type": reward_type,
            "base_earn_rate": base_earn_rate,
            "point_value": point_value,
            "welcome_bonus_points": welcome_bonus_points,
            "milestones": milestones,
        },
        "category_rates": category_rates,
        "travel_benefits": travel,
        "lifestyle_benefits": lifestyle,
        "digital": {
            "upi_credit_card": upi_credit_card,
            "google_pay": google_pay,
            "no_cost_emi": no_cost_emi,
            "virtual_card": virtual_card,
        },
        "engine_meta": {
            "best_for_profile": best_for_profile,
            "competes_with": competes_with,
            "complementary_cards": complementary_cards,
        },
    }

# ── Standard category rate templates ─────────────────────────────────────

def base_rates(base, **overrides):
    cats = ["food_delivery","groceries","dining","online_shopping","fuel",
            "upi","travel","entertainment","pharmacy","international_forex",
            "rent","education","tax","insurance","emi"]
    result = {}
    for c in cats:
        if c in overrides:
            v = overrides[c]
            if v is None:
                result[c] = {"excluded": True}
            else:
                result[c] = {"rate": v}
        else:
            result[c] = {"rate": base}
    return result


# ── Load 10-card base JSON ─────────────────────────────────────────────────

with open(os.path.join(BASE_DIR, "data", "cards_10_base.json"), encoding="utf-8") as f:
    base_cards = json.load(f)

# Index by card_id
cards_dict = {c["card_id"]: c for c in base_cards}

# ── Fix the 10 base cards (apply FIX 3 best_for_profile corrections) ───────

TAG_MAP = {
    "fuel": "cashback",
    "upi_primary": "cashback",
    "forex": "travel",
    "luxury_travel": "premium_lifestyle",
    "hotel_stays": "premium_lifestyle",
    "tax_payments": "maximize_rewards",
    "education_payments": "maximize_rewards",
    "online_shopping": "maximize_rewards",
    "food_delivery": "cashback",
    "tata_ecosystem": "cashback",
    "international_travel": "travel",
}

for c in cards_dict.values():
    pv = c.get("rewards", {}).get("point_value", {})
    # Remove string values from point_value
    for k in list(pv.keys()):
        if isinstance(pv[k], str):
            del pv[k]
    # Fix best_for_profile
    bfp = c.get("engine_meta", {}).get("best_for_profile", [])
    new_bfp = []
    seen = set()
    for tag in bfp:
        r = TAG_MAP.get(tag, tag)
        if r not in seen:
            new_bfp.append(r)
            seen.add(r)
    c["engine_meta"]["best_for_profile"] = new_bfp
    # Fix category_rates note keys
    for cat_obj in c.get("category_rates", {}).values():
        if isinstance(cat_obj, dict):
            cat_obj.pop("note", None)

# Fix hdfc_diners_black lounge
if "hdfc_diners_black" in cards_dict:
    dl = cards_dict["hdfc_diners_black"].get("travel_benefits", {}).get("domestic_lounge", {})
    if dl.get("visits_per_quarter") == 999:
        dl["visits_per_quarter"] = 6

# ── New cards: built from data 1.txt + known data ─────────────────────────

new_cards = [

    # ── FUEL CARDS ────────────────────────────────────────────────────────
    card(
        "sbi_bpcl_octane", "SBI BPCL Octane Credit Card", "SBI Card", "visa", "entry",
        annual_fee=1499, joining_fee=1499, fee_waiver_threshold=200000,
        min_credit_score=750, min_income_sal=600000, min_income_se=900000,
        reward_type="points", base_earn_rate=1.0,
        point_value={"cashback": 0.25, "travel": 0.25},
        welcome_bonus_points=6000,
        milestones=[{"spend_threshold": 300000, "bonus_points": 8000}],
        category_rates={
            "food_delivery": {"rate": 10}, "groceries": {"rate": 10},
            "dining": {"rate": 10}, "online_shopping": {"rate": 1},
            "fuel": {"rate": 25, "monthly_cap_points": 2500},
            "upi": {"rate": 1}, "travel": {"rate": 1},
            "entertainment": {"rate": 10}, "pharmacy": {"rate": 1},
            "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=4, air_accident_cover=10000000,
        upi_credit_card=False,
        best_for_profile=["cashback"],
        competes_with=["rbl_indianoil_xtra", "idfc_power_plus"],
    ),

    card(
        "rbl_indianoil_xtra", "RBL IndianOil XTRA Credit Card", "RBL Bank", "visa", "entry",
        annual_fee=1500, joining_fee=1500, fee_waiver_threshold=275000,
        min_credit_score=750, min_income_sal=600000, min_income_se=900000,
        reward_type="points", base_earn_rate=2.0,
        point_value={"cashback": 0.50, "travel": 0.10},
        welcome_bonus_points=3000,
        milestones=[{"spend_threshold": 100000, "bonus_points": 1000}],
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 2}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 15, "monthly_cap_points": 2000},
            "upi": {"rate": 2}, "travel": {"rate": 2},
            "entertainment": {"rate": 2}, "pharmacy": {"rate": 2},
            "international_forex": {"rate": 2},
            "rent": {"excluded": True}, "education": {"rate": 2},
            "tax": {"excluded": True}, "insurance": {"rate": 2},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=2, air_accident_cover=0,
        best_for_profile=["cashback"],
        competes_with=["sbi_bpcl_octane", "idfc_power_plus"],
    ),

    card(
        "idfc_power_plus", "IDFC FIRST Power+ Credit Card", "IDFC FIRST Bank", "visa", "entry",
        annual_fee=999, fee_waiver_threshold=200000,
        min_credit_score=700, min_income_sal=350000, min_income_se=350000,
        reward_type="points", base_earn_rate=1.0,
        point_value={"cashback": 0.25},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 1}, "groceries": {"rate": 1},
            "dining": {"rate": 1}, "online_shopping": {"rate": 1},
            "fuel": {"rate": 10, "monthly_cap_points": 300},
            "upi": {"rate": 1}, "travel": {"rate": 1},
            "entertainment": {"rate": 1}, "pharmacy": {"rate": 1},
            "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=4, air_accident_cover=0,
        best_for_profile=["cashback"],
        competes_with=["sbi_bpcl_octane", "rbl_indianoil_xtra"],
    ),

    card(
        "bob_hpcl_energie", "Bank of Baroda HPCL Energie Credit Card", "Bank of Baroda", "rupay", "entry",
        annual_fee=499, fee_waiver_threshold=150000,
        min_credit_score=700, min_income_sal=350000, min_income_se=350000,
        reward_type="points", base_earn_rate=1.0,
        point_value={"cashback": 0.25},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 5}, "groceries": {"rate": 5},
            "dining": {"rate": 5}, "online_shopping": {"rate": 1},
            "fuel": {"rate": 10, "monthly_cap_points": 1500},
            "upi": {"rate": 1}, "travel": {"rate": 1},
            "entertainment": {"rate": 1}, "pharmacy": {"rate": 1},
            "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["sbi_bpcl_octane", "idfc_power_plus"],
    ),

    card(
        "axis_indianoil", "Axis Indian Oil Credit Card", "Axis Bank", "rupay", "entry",
        annual_fee=500, fee_waiver_threshold=150000,
        min_credit_score=700, min_income_sal=350000, min_income_se=350000,
        reward_type="points", base_earn_rate=1.0,
        point_value={"cashback": 0.25},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 1}, "groceries": {"rate": 1},
            "dining": {"rate": 1}, "online_shopping": {"rate": 1},
            "fuel": {"rate": 20, "monthly_cap_points": 2000},
            "upi": {"rate": 1}, "travel": {"rate": 1},
            "entertainment": {"rate": 1}, "pharmacy": {"rate": 1},
            "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["sbi_bpcl_octane", "bob_hpcl_energie"],
    ),

    # ── UPI/RUPAY CASHBACK CARDS ──────────────────────────────────────────
    card(
        "kiwi_rupay", "Kiwi RuPay Credit Card", "SBM Bank", "rupay", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=650, min_income_sal=300000, min_income_se=300000,
        reward_type="points", base_earn_rate=1.0,
        point_value={"cashback": 0.25},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 3}, "groceries": {"rate": 3},
            "dining": {"rate": 3}, "online_shopping": {"rate": 3},
            "fuel": {"rate": 1}, "upi": {"rate": 3},
            "travel": {"rate": 3}, "entertainment": {"rate": 3},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback", "maximize_rewards"],
        competes_with=["hdfc_upi_rupay", "kotak_upi_rupay"],
    ),

    card(
        "sbi_simplysave_rupay", "SBI SimplySAVE RuPay Credit Card", "State Bank of India", "rupay", "entry",
        annual_fee=499, fee_waiver_threshold=100000,
        min_credit_score=650, min_income_sal=200000, min_income_se=200000,
        reward_type="points", base_earn_rate=1.0,
        point_value={"cashback": 0.25},
        welcome_bonus_points=2000,
        category_rates={
            "food_delivery": {"rate": 10}, "groceries": {"rate": 10},
            "dining": {"rate": 10}, "online_shopping": {"rate": 1},
            "fuel": {"rate": 1}, "upi": {"rate": 1},
            "travel": {"rate": 1}, "entertainment": {"rate": 1},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["axis_ace", "kiwi_rupay"],
    ),

    card(
        "hdfc_upi_rupay", "HDFC UPI RuPay Credit Card", "HDFC Bank", "rupay", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=650, min_income_sal=300000, min_income_se=300000,
        reward_type="cashback", base_earn_rate=3.0,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 3}, "groceries": {"rate": 3},
            "dining": {"rate": 3}, "online_shopping": {"rate": 3},
            "fuel": {"rate": 1}, "upi": {"rate": 3},
            "travel": {"rate": 3}, "entertainment": {"rate": 3},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["kiwi_rupay", "kotak_upi_rupay"],
    ),

    card(
        "kotak_upi_rupay", "Kotak UPI RuPay Credit Card", "Kotak Mahindra Bank", "rupay", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=650, min_income_sal=300000, min_income_se=300000,
        reward_type="cashback", base_earn_rate=1.0,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates=base_rates(1.0, rent=None, tax=None, emi=None),
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["hdfc_upi_rupay", "kiwi_rupay"],
    ),

    card(
        "axis_supermoney_rupay", "Axis Bank SuperMoney RuPay Credit Card", "Axis Bank", "rupay", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=650, min_income_sal=300000, min_income_se=300000,
        reward_type="cashback", base_earn_rate=1.5,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 5}, "groceries": {"rate": 5},
            "dining": {"rate": 3}, "online_shopping": {"rate": 3},
            "fuel": {"rate": 1}, "upi": {"rate": 3},
            "travel": {"rate": 1}, "entertainment": {"rate": 1},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["hdfc_upi_rupay", "kiwi_rupay"],
    ),

    card(
        "hsbc_rupay_cashback", "HSBC RuPay Cashback Credit Card", "HSBC", "rupay", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=700, min_income_sal=400000, min_income_se=400000,
        reward_type="cashback", base_earn_rate=1.5,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates=base_rates(1.5, rent=None, tax=None, emi=None),
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["hdfc_upi_rupay", "kotak_upi_rupay"],
    ),

    card(
        "icici_coral_rupay", "ICICI Coral RuPay Credit Card", "ICICI Bank", "rupay", "entry",
        annual_fee=500, fee_waiver_threshold=150000,
        min_credit_score=700, min_income_sal=350000, min_income_se=350000,
        reward_type="points", base_earn_rate=2.0,
        point_value={"cashback": 0.25},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 2}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 1, "monthly_cap_points": 100},
            "upi": {"rate": 2}, "travel": {"rate": 2},
            "entertainment": {"rate": 2}, "pharmacy": {"rate": 2},
            "international_forex": {"rate": 2},
            "rent": {"excluded": True}, "education": {"rate": 2},
            "tax": {"excluded": True}, "insurance": {"rate": 2},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=2, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["kiwi_rupay", "sbi_simplysave_rupay"],
    ),

    # ── TRAVEL / FOREX CARDS ──────────────────────────────────────────────
    card(
        "equitas_powermiles", "Equitas Powermiles Credit Card", "Equitas Small Finance Bank", "visa", "mid",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=700, min_income_sal=300000, min_income_se=300000,
        reward_type="miles", base_earn_rate=2.0,
        point_value={"travel": 1.0, "cashback": 0.25},
        welcome_bonus_points=2000,
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 4}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 1}, "upi": {"rate": 2},
            "travel": {"rate": 6}, "entertainment": {"rate": 2},
            "pharmacy": {"rate": 2}, "international_forex": {"rate": 4},
            "rent": {"excluded": True}, "education": {"rate": 2},
            "tax": {"excluded": True}, "insurance": {"rate": 2},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=2, intl_lounge_y=2, air_accident_cover=0,
        best_for_profile=["travel"],
        competes_with=["scapia", "idfc_wow"],
    ),

    card(
        "idfc_wow", "IDFC FIRST WOW Credit Card", "IDFC FIRST Bank", "visa", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=650, min_income_sal=200000, min_income_se=200000,
        reward_type="points", base_earn_rate=3.0,
        point_value={"cashback": 0.25, "travel": 0.5},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 6}, "groceries": {"rate": 6},
            "dining": {"rate": 6}, "online_shopping": {"rate": 6},
            "fuel": {"rate": 1}, "upi": {"rate": 6},
            "travel": {"rate": 6}, "entertainment": {"rate": 6},
            "pharmacy": {"rate": 3}, "international_forex": {"rate": 6},
            "rent": {"rate": 1}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 3},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=False,
        best_for_profile=["travel", "cashback"],
        competes_with=["scapia", "au_ixigo"],
    ),

    card(
        "scapia", "Scapia Credit Card", "Federal Bank", "visa", "mid",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=700, min_income_sal=400000, min_income_se=400000,
        reward_type="cashback", base_earn_rate=10.0,  # 10% on international (Scapia coins)
        point_value={"cashback": 0.20, "travel_portal": 1.0},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 2}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 1}, "upi": {"rate": 1},
            "travel": {"rate": 10}, "entertainment": {"rate": 2},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 10},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=2, intl_lounge_y=0, air_accident_cover=0,
        best_for_profile=["travel", "cashback"],
        competes_with=["idfc_wow", "au_ixigo"],
    ),

    card(
        "au_ixigo", "AU ixigo Credit Card", "AU Small Finance Bank", "rupay", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=700, min_income_sal=300000, min_income_se=300000,
        reward_type="points", base_earn_rate=2.0,
        point_value={"travel": 0.5, "cashback": 0.25},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 2}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 1}, "upi": {"rate": 2},
            "travel": {"rate": 10, "monthly_cap_points": 2000},
            "entertainment": {"rate": 2},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 4},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=1, intl_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["travel"],
        competes_with=["scapia", "idfc_wow"],
    ),

    card(
        "hsbc_premier", "HSBC Premier Credit Card", "HSBC", "visa", "premium",
        annual_fee=0, is_lifetime_free=True,  # free for Premier banking customers
        min_credit_score=750, min_income_sal=1500000, min_income_se=1500000,
        parent_bank_required=True,
        reward_type="points", base_earn_rate=2.0,
        point_value={"travel": 1.0, "cashback": 0.50},
        welcome_bonus_points=10000,
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 4}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 1}, "upi": {"rate": 2},
            "travel": {"rate": 4}, "entertainment": {"rate": 2},
            "pharmacy": {"rate": 2}, "international_forex": {"rate": 4},
            "rent": {"rate": 1}, "education": {"rate": 2},
            "tax": {"excluded": True}, "insurance": {"rate": 2},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=4, intl_lounge_y=6, air_accident_cover=50000000,
        golf=True, concierge=True,
        best_for_profile=["travel", "maximize_rewards"],
        competes_with=["hdfc_regalia", "sc_ultimate"],
    ),

    # ── PREMIUM / LUXURY CARDS ────────────────────────────────────────────
    card(
        "icici_emeralde_private_metal", "ICICI Emeralde Private Metal Credit Card",
        "ICICI Bank", "visa", "super_premium",
        annual_fee=12000, joining_fee=12000, fee_waiver_threshold=0,
        min_credit_score=800, min_income_sal=3000000, min_income_se=3000000,
        invite_only=True,
        reward_type="points", base_earn_rate=6.0,
        point_value={"travel": 1.0, "statement": 0.5},
        welcome_bonus_points=30000,
        milestones=[{"spend_threshold": 1000000, "bonus_points": 25000}],
        category_rates={
            "food_delivery": {"rate": 6}, "groceries": {"rate": 6},
            "dining": {"rate": 6}, "online_shopping": {"rate": 6},
            "fuel": {"rate": 1}, "upi": {"rate": 6},
            "travel": {"rate": 6}, "entertainment": {"rate": 6},
            "pharmacy": {"rate": 6}, "international_forex": {"rate": 6},
            "rent": {"rate": 2}, "education": {"rate": 6},
            "tax": {"excluded": True}, "insurance": {"rate": 6},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=999, domestic_lounge_y=999, intl_lounge_y=999,
        air_accident_cover=100000000,
        golf=True, concierge=True, movies=4, ott=True,
        dining_program="Emeralde Epicure",
        best_for_profile=["premium_lifestyle", "travel"],
        competes_with=["hdfc_infinia_metal", "yes_private"],
    ),

    card(
        "hdfc_infinia_metal", "HDFC Infinia Metal Credit Card", "HDFC Bank", "visa", "super_premium",
        annual_fee=12500, joining_fee=12500,
        min_credit_score=800, min_income_sal=3000000, min_income_se=3000000,
        invite_only=True,
        reward_type="points", base_earn_rate=3.33,
        point_value={"travel_portal": 1.0, "statement": 0.5},
        welcome_bonus_points=12500,
        milestones=[{"spend_threshold": 800000, "bonus_points": 10000}],
        category_rates={
            "food_delivery": {"rate": 3.33}, "groceries": {"rate": 3.33},
            "dining": {"rate": 3.33}, "online_shopping": {"rate": 3.33},
            "fuel": {"rate": 1}, "upi": {"rate": 3.33},
            "travel": {"rate": 16.67},  # 5x SmartBuy
            "entertainment": {"rate": 3.33},
            "pharmacy": {"rate": 3.33}, "international_forex": {"rate": 3.33},
            "rent": {"rate": 1}, "education": {"rate": 3.33},
            "tax": {"excluded": True}, "insurance": {"rate": 3.33},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=6, domestic_lounge_y=999,
        intl_lounge_y=999, air_accident_cover=100000000,
        golf=True, concierge=True, ott=True,
        dining_program="Good Food Trail",
        best_for_profile=["premium_lifestyle", "travel"],
        competes_with=["icici_emeralde_private_metal", "yes_private"],
    ),

    card(
        "hsbc_taj", "HSBC Taj Credit Card", "HSBC", "visa", "premium",
        annual_fee=5000, fee_waiver_threshold=500000,
        min_credit_score=750, min_income_sal=1800000, min_income_se=1800000,
        reward_type="points", base_earn_rate=2.0,
        point_value={"travel": 0.66, "cashback": 0.33},
        welcome_bonus_points=8000,
        milestones=[{"spend_threshold": 300000, "bonus_points": 5000}],
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 6},  # 3x dining
            "online_shopping": {"rate": 2}, "fuel": {"rate": 1},
            "upi": {"rate": 2}, "travel": {"rate": 6},
            "entertainment": {"rate": 2},
            "pharmacy": {"rate": 2}, "international_forex": {"rate": 4},
            "rent": {"rate": 1}, "education": {"rate": 2},
            "tax": {"excluded": True}, "insurance": {"rate": 2},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=2, intl_lounge_y=2, air_accident_cover=25000000,
        golf=True, concierge=True,
        dining_program="Taj Epicure",
        best_for_profile=["premium_lifestyle", "travel"],
        competes_with=["icici_emeralde_private_metal", "hdfc_regalia_gold"],
    ),

    # ── BUSINESS CARDS ────────────────────────────────────────────────────
    card(
        "hdfc_bizblack", "HDFC BizBlack Credit Card", "HDFC Bank", "mastercard", "super_premium",
        annual_fee=10000, joining_fee=10000,
        min_credit_score=800, min_income_sal=3000000, min_income_se=3000000,
        eligible_employment=["self_employed", "business_owner"],
        invite_only=True,
        reward_type="points", base_earn_rate=3.33,
        point_value={"travel_portal": 1.0, "statement": 0.5},
        welcome_bonus_points=10000,
        category_rates={
            "food_delivery": {"rate": 3.33}, "groceries": {"rate": 3.33},
            "dining": {"rate": 3.33}, "online_shopping": {"rate": 3.33},
            "fuel": {"rate": 1}, "upi": {"rate": 3.33},
            "travel": {"rate": 16.67},
            "entertainment": {"rate": 3.33},
            "pharmacy": {"rate": 3.33}, "international_forex": {"rate": 3.33},
            "rent": {"rate": 1}, "education": {"rate": 3.33},
            "tax": {"rate": 1}, "insurance": {"rate": 3.33},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=6, intl_lounge_y=6, air_accident_cover=100000000,
        golf=True, concierge=True,
        best_for_profile=["business", "maximize_rewards"],
        competes_with=["amex_mrcc", "hdfc_infinia_metal"],
    ),

    card(
        "hdfc_bizpower", "HDFC BizPower Credit Card", "HDFC Bank", "mastercard", "premium",
        annual_fee=5000, joining_fee=5000,
        min_credit_score=750, min_income_sal=1500000, min_income_se=1500000,
        eligible_employment=["self_employed", "business_owner"],
        reward_type="points", base_earn_rate=2.0,
        point_value={"travel": 0.5, "cashback": 0.35},
        welcome_bonus_points=5000,
        category_rates=base_rates(2.0, fuel=1, rent=1, tax=1, emi=None),
        domestic_lounge_q=2, intl_lounge_y=2, air_accident_cover=10000000,
        concierge=True,
        best_for_profile=["business", "maximize_rewards"],
        competes_with=["hdfc_bizblack", "amex_mrcc"],
    ),

    # ── OTHER PREMIUM / TRAVEL CARDS ──────────────────────────────────────
    card(
        "amex_platinum_travel", "American Express Platinum Travel Credit Card",
        "American Express", "amex", "premium",
        annual_fee=5000, joining_fee=5000,
        min_credit_score=750, min_income_sal=1800000, min_income_se=1800000,
        reward_type="points", base_earn_rate=1.0,
        point_value={"travel": 0.50, "cashback": 0.25},
        welcome_bonus_points=5000,
        milestones=[
            {"spend_threshold": 190000, "bonus_points": 7500},
            {"spend_threshold": 400000, "bonus_points": 11000},
        ],
        category_rates=base_rates(1.0, fuel=1, rent=None, tax=None, emi=None),
        domestic_lounge_q=4, intl_lounge_y=3, air_accident_cover=10000000,
        concierge=True, ott=True,
        best_for_profile=["travel", "maximize_rewards"],
        competes_with=["axis_atlas", "hdfc_regalia"],
    ),

    card(
        "yes_private", "YES Private Credit Card", "YES BANK", "visa", "super_premium",
        annual_fee=10000,
        min_credit_score=800, min_income_sal=2500000, min_income_se=2500000,
        invite_only=True,
        reward_type="points", base_earn_rate=3.0,
        point_value={"travel": 1.0, "cashback": 0.50},
        welcome_bonus_points=15000,
        category_rates={
            "food_delivery": {"rate": 3}, "groceries": {"rate": 3},
            "dining": {"rate": 6}, "online_shopping": {"rate": 3},
            "fuel": {"rate": 1}, "upi": {"rate": 3},
            "travel": {"rate": 9}, "entertainment": {"rate": 3},
            "pharmacy": {"rate": 3}, "international_forex": {"rate": 6},
            "rent": {"rate": 1}, "education": {"rate": 3},
            "tax": {"rate": 1}, "insurance": {"rate": 3},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=999, intl_lounge_y=999, air_accident_cover=100000000,
        golf=True, concierge=True, ott=True,
        best_for_profile=["premium_lifestyle", "travel"],
        competes_with=["hdfc_infinia_metal", "icici_emeralde_private_metal"],
    ),

    card(
        "icici_times_black", "ICICI Times Black Credit Card", "ICICI Bank", "mastercard", "super_premium",
        annual_fee=20000,
        min_credit_score=800, min_income_sal=5000000, min_income_se=5000000,
        invite_only=True,
        reward_type="points", base_earn_rate=2.0,
        point_value={"cashback": 0.25, "travel": 0.5},
        welcome_bonus_points=10000,
        category_rates=base_rates(2.0, fuel=1, rent=1, tax=1, emi=None),
        domestic_lounge_q=999, intl_lounge_y=999, air_accident_cover=100000000,
        golf=True, concierge=True, ott=True, movies=2,
        best_for_profile=["premium_lifestyle", "maximize_rewards"],
        competes_with=["hdfc_infinia_metal", "icici_emeralde_private_metal"],
    ),

    card(
        "idfc_club_vistara", "IDFC FIRST Club Vistara Credit Card", "IDFC FIRST Bank", "visa", "premium",
        annual_fee=2499,
        min_credit_score=750, min_income_sal=800000, min_income_se=800000,
        reward_type="miles", base_earn_rate=2.0,
        point_value={"travel": 0.5, "cashback": 0.25},
        welcome_bonus_points=5000,
        milestones=[{"spend_threshold": 300000, "bonus_points": 5000}],
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 2}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 1}, "upi": {"rate": 2},
            "travel": {"rate": 6}, "entertainment": {"rate": 2},
            "pharmacy": {"rate": 2}, "international_forex": {"rate": 4},
            "rent": {"rate": 1}, "education": {"rate": 2},
            "tax": {"rate": 1}, "insurance": {"rate": 2},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=2, intl_lounge_y=2, air_accident_cover=10000000,
        best_for_profile=["travel", "maximize_rewards"],
        competes_with=["axis_atlas", "amex_platinum_travel"],
    ),

    card(
        "hsbc_premier_metal", "HSBC Premier Metal Credit Card", "HSBC", "visa", "super_premium",
        annual_fee=50000,
        min_credit_score=800, min_income_sal=5000000, min_income_se=5000000,
        parent_bank_required=True,
        reward_type="points", base_earn_rate=3.0,
        point_value={"travel": 1.0, "cashback": 0.50},
        welcome_bonus_points=25000,
        category_rates=base_rates(3.0, fuel=1, rent=1, tax=None, emi=None),
        domestic_lounge_q=999, intl_lounge_y=999, air_accident_cover=100000000,
        golf=True, concierge=True, ott=True, movies=2,
        best_for_profile=["premium_lifestyle", "travel", "maximize_rewards"],
        competes_with=["hdfc_infinia_metal", "yes_private"],
    ),

    card(
        "sc_ultimate", "Standard Chartered Ultimate Credit Card",
        "Standard Chartered", "visa", "premium",
        annual_fee=5000, fee_waiver_threshold=500000,
        min_credit_score=750, min_income_sal=1200000, min_income_se=1200000,
        reward_type="points", base_earn_rate=3.33,
        point_value={"cashback": 1.0, "travel": 1.0},
        welcome_bonus_points=5000,
        category_rates={
            "food_delivery": {"rate": 3.33}, "groceries": {"rate": 3.33},
            "dining": {"rate": 3.33}, "online_shopping": {"rate": 3.33},
            "fuel": {"rate": 1}, "upi": {"rate": 3.33},
            "travel": {"rate": 3.33}, "entertainment": {"rate": 3.33},
            "pharmacy": {"rate": 3.33}, "international_forex": {"rate": 3.33},
            "rent": {"rate": 1}, "education": {"rate": 3.33},
            "tax": {"excluded": True}, "insurance": {"rate": 3.33},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=2, intl_lounge_y=6, air_accident_cover=25000000,
        concierge=True,
        best_for_profile=["maximize_rewards", "travel"],
        competes_with=["hdfc_regalia", "axis_atlas"],
    ),

    card(
        "jupiter_edge_plus", "Jupiter Edge+ Credit Card", "CSB Bank (Jupiter)", "rupay", "entry",
        annual_fee=0, is_lifetime_free=True,
        min_credit_score=650, min_income_sal=300000, min_income_se=300000,
        reward_type="cashback", base_earn_rate=2.0,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 5}, "groceries": {"rate": 5},
            "dining": {"rate": 5}, "online_shopping": {"rate": 5},
            "fuel": {"rate": 1}, "upi": {"rate": 5},
            "travel": {"rate": 2}, "entertainment": {"rate": 2},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback", "maximize_rewards"],
        competes_with=["axis_ace", "hdfc_millennia"],
    ),

    card(
        "hdfc_swiggy", "Swiggy HDFC Bank Credit Card", "HDFC Bank", "visa", "entry",
        annual_fee=500, fee_waiver_threshold=200000,
        min_credit_score=700, min_income_sal=350000, min_income_se=350000,
        reward_type="cashback", base_earn_rate=1.0,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 10, "monthly_cap_points": 1500},
            "groceries": {"rate": 5, "monthly_cap_points": 1500},
            "dining": {"rate": 5}, "online_shopping": {"rate": 5, "monthly_cap_points": 1500},
            "fuel": {"rate": 1}, "upi": {"rate": 1},
            "travel": {"rate": 1}, "entertainment": {"rate": 5},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        best_for_profile=["cashback"],
        competes_with=["axis_ace", "jupiter_edge_plus"],
    ),

    card(
        "tata_neu_infinity_hdfc", "Tata Neu Infinity HDFC Bank Credit Card", "HDFC Bank", "rupay", "mid",
        annual_fee=1499, fee_waiver_threshold=300000,
        min_credit_score=700, min_income_sal=350000, min_income_se=350000,
        reward_type="cashback", base_earn_rate=1.0,
        point_value={"cashback": 1.0},  # 1 NeuCoin = ₹1 in Tata Neu ecosystem
        welcome_bonus_points=499,
        milestones=[{"spend_threshold": 300000, "bonus_points": 499}],
        category_rates={
            "food_delivery": {"rate": 5}, "groceries": {"rate": 5},
            "dining": {"rate": 5}, "online_shopping": {"rate": 5},
            "fuel": {"rate": 1}, "upi": {"rate": 1},
            "travel": {"rate": 5}, "entertainment": {"rate": 5},
            "pharmacy": {"rate": 5}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 5},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=2, intl_lounge_y=2, air_accident_cover=10000000,
        upi_credit_card=True,
        best_for_profile=["cashback", "maximize_rewards"],
        competes_with=["hdfc_millennia", "icici_amazon_pay"],
    ),

    # ── HDFC REGALIA GOLD ─────────────────────────────────────────────────
    card(
        "hdfc_regalia_gold", "HDFC Regalia Gold Credit Card", "HDFC Bank", "visa", "mid",
        annual_fee=2500, fee_waiver_threshold=400000,
        min_credit_score=750, min_income_sal=1800000, min_income_se=1800000,
        reward_type="points", base_earn_rate=2.67,
        point_value={"travel": 0.5, "statement": 0.5},
        welcome_bonus_points=0,
        milestones=[
            {"spend_threshold": 500000, "bonus_points": 10000},
            {"spend_threshold": 750000, "bonus_points": 10000},
        ],
        category_rates={
            "food_delivery": {"rate": 2.67}, "groceries": {"rate": 2.67},
            "dining": {"rate": 2.67}, "online_shopping": {"rate": 2.67},
            "fuel": {"excluded": True}, "upi": {"rate": 2.67},
            "travel": {"rate": 13.35},
            "entertainment": {"rate": 2.67},
            "pharmacy": {"rate": 2.67}, "international_forex": {"excluded": True},
            "rent": {"rate": 2.67}, "education": {"rate": 2.67},
            "tax": {"rate": 2.67}, "insurance": {"rate": 2.67},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=3, intl_lounge_y=6, air_accident_cover=10000000,
        concierge=True, ott="Swiggy One",
        dining_program="Good Food Trail",
        best_for_profile=["travel", "maximize_rewards"],
        competes_with=["sbi_prime", "axis_atlas", "amex_mrcc"],
        complementary_cards=["hdfc_millennia", "hdfc_diners_black"],
    ),

    # ── SBI CASHBACK ──────────────────────────────────────────────────────
    card(
        "sbi_cashback", "SBI Cashback Credit Card", "State Bank of India", "visa", "mid",
        annual_fee=999, fee_waiver_threshold=200000,
        min_credit_score=700, min_income_sal=400000, min_income_se=400000,
        reward_type="cashback", base_earn_rate=1.0,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 5}, "groceries": {"rate": 5},
            "dining": {"rate": 5}, "online_shopping": {"rate": 5},
            "fuel": {"rate": 1}, "upi": {"rate": 1},
            "travel": {"rate": 5}, "entertainment": {"rate": 5},
            "pharmacy": {"rate": 1}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 1},
            "emi": {"excluded": True},
        },
        domestic_lounge_y=0, air_accident_cover=0,
        best_for_profile=["cashback"],
        competes_with=["axis_ace", "icici_amazon_pay"],
    ),

    # ── HDFC TATA NEU PLUS (entry tier) ───────────────────────────────────
    card(
        "tata_neu_plus_hdfc", "Tata Neu Plus HDFC Bank Credit Card", "HDFC Bank", "rupay", "entry",
        annual_fee=499, fee_waiver_threshold=100000,
        min_credit_score=700, min_income_sal=300000, min_income_se=300000,
        reward_type="cashback", base_earn_rate=1.0,
        point_value={"cashback": 1.0},
        welcome_bonus_points=0,
        category_rates={
            "food_delivery": {"rate": 2}, "groceries": {"rate": 2},
            "dining": {"rate": 2}, "online_shopping": {"rate": 2},
            "fuel": {"rate": 1}, "upi": {"rate": 1},
            "travel": {"rate": 2}, "entertainment": {"rate": 2},
            "pharmacy": {"rate": 2}, "international_forex": {"rate": 1},
            "rent": {"excluded": True}, "education": {"rate": 1},
            "tax": {"excluded": True}, "insurance": {"rate": 2},
            "emi": {"excluded": True},
        },
        domestic_lounge_q=1, air_accident_cover=0,
        upi_credit_card=True,
        best_for_profile=["cashback"],
        competes_with=["hdfc_millennia", "axis_ace"],
    ),
]

# ── Merge: base 10 + new cards (skip duplicates) ──────────────────────────
for nc in new_cards:
    cid = nc["card_id"]
    if cid not in cards_dict:
        cards_dict[cid] = nc

# ── Final ordering ────────────────────────────────────────────────────────
ORDER = [
    # HDFC
    "hdfc_regalia", "hdfc_regalia_gold", "hdfc_millennia", "hdfc_diners_black",
    "hdfc_infinia_metal", "hdfc_bizblack", "hdfc_bizpower",
    "hdfc_swiggy", "hdfc_upi_rupay", "tata_neu_infinity_hdfc", "tata_neu_plus_hdfc",
    # ICICI
    "icici_amazon_pay", "icici_emeralde_private_metal", "icici_times_black", "icici_coral_rupay",
    # AXIS
    "axis_atlas", "axis_ace", "axis_indianoil", "axis_supermoney_rupay",
    # SBI
    "sbi_prime", "sbi_simply_click", "sbi_bpcl_octane", "sbi_simplysave_rupay", "sbi_cashback",
    # AMEX
    "amex_mrcc", "amex_platinum_travel",
    # IDFC
    "idfc_first_classic", "idfc_wow", "idfc_power_plus", "idfc_club_vistara",
    # SC
    "sc_ultimate",
    # HSBC
    "hsbc_taj", "hsbc_premier", "hsbc_premier_metal", "hsbc_rupay_cashback",
    # YES
    "yes_private",
    # Kotak
    "kotak_upi_rupay",
    # RBL
    "rbl_indianoil_xtra",
    # BOB
    "bob_hpcl_energie",
    # AU
    "au_ixigo",
    # Equitas
    "equitas_powermiles",
    # Federal/Scapia
    "scapia",
    # SBM/Kiwi
    "kiwi_rupay",
    # Jupiter
    "jupiter_edge_plus",
]

final_cards = []
for cid in ORDER:
    if cid in cards_dict:
        final_cards.append(cards_dict[cid])

# Add any cards not in order
for cid, c in cards_dict.items():
    if cid not in ORDER:
        final_cards.append(c)

print(f"Total cards: {len(final_cards)}")
for c in final_cards:
    print(f"  {c['card_id']}: {c['card_name']}")

with open(os.path.join(BASE_DIR, "data", "cards_data.json"), "w", encoding="utf-8") as f:
    json.dump(final_cards, f, ensure_ascii=False, indent=2)

print("\ncards_data.json written successfully!")
