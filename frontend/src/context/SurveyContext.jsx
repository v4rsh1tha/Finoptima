import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  // Profile (Layer 1)
  income: null,
  credit_score: null,
  employment: null,
  existing_cards: null,
  fee_preference: null,
  bank_accounts: [],

  // Spend (Layer 2)
  total_spend_range: null,
  food_delivery_spend: 0,
  groceries_spend: 0,
  dining_spend: 0,
  online_shopping_spend: 0,
  fuel_spend: 0,
  upi_spend: 0,
  travel_spend: 0,
  entertainment_spend: 0,
  pharmacy_spend: 0,
  international_spend: 0,
  emi_spend: 0,
  rent_spend: 0,
  education_spend: 0,
  tax_spend: 0,
  insurance_spend: 0,

  // Follow-ups (Layer 2)
  food_platform: null,
  grocery_apps: [],
  shopping_platforms: [],
  fuel_brand: null,

  // Preferences (Layer 3)
  domestic_flights: null,
  international_flights: null,
  airline: null,
  lounge_visits_needed: null,
  hotel_stays: null,
  hotel_preference: null,
  hotel_loyalty: [],
  concierge: false,
  golf: false,
  card_purpose: null,

  // API state
  loading: false,
  recommendations: null,
  detected_intent: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE': return { ...state, ...action.payload };
    case 'RESET':  return initialState;
    default:       return state;
  }
}

const SurveyContext = createContext(null);

export const SurveyProvider = ({ children }) => {
  const [survey, dispatch] = useReducer(reducer, initialState);
  const updateSurvey = (payload) => dispatch({ type: 'UPDATE', payload });
  const resetSurvey  = ()        => dispatch({ type: 'RESET' });

  return (
    <SurveyContext.Provider value={{ survey, updateSurvey, resetSurvey }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
};
