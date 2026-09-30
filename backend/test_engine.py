import requests
import json

url = "http://localhost:5000/api/recommend"

test1 = {
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
  }
}

test2 = {
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
  }
}

test3 = {
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
    "food_delivery_spend": 3000,
    "groceries_spend": 2000,
    "dining_spend": 0,
    "online_shopping_spend": 3000,
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
  }
}

tests = [
  ("TEST 1 - Student Zero Fee", test1),
  ("TEST 2 - High Earner Premium", test2),
  ("TEST 3 - UPI Heavy Digital", test3)
]

for name, payload in tests:
  print(f"\n{'='*50}")
  print(f"{name}")
  print('='*50)
  r = requests.post(url, json=payload)
  data = r.json()
  print(f"Detected intent: {data.get('detected_intent')}")
  print(f"Secondary intent: {data.get('secondary_intent')}")
  recs = data.get('recommendations', [])
  for i, card in enumerate(recs):
    print(f"\n#{i+1} {card['card_name']}")
    print(f"  Bank: {card['bank_name']}")
    print(f"  Fee: {card['annual_fee']} | LTF: {card['is_lifetime_free']}")
    print(f"  Est Reward: {card['estimated_annual_reward']}")
    print(f"  Final Score: {card['final_score']}")
    s = card['score_breakdown']
    rv = card.get('rupee_value_score', 'N/A')
    print(f"  Scores: Intent={s['intent']} Fit={s['fit']} Elig={s['eligibility']} RV={rv}")
