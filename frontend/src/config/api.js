// Central place for backend API configuration.
//
// Set REACT_APP_API_URL in your environment (or a .env / .env.production
// file) to point the frontend at the correct backend host. Falls back to
// localhost:5000 for local development so `npm start` keeps working
// out of the box.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  recommend: `${API_BASE_URL}/api/recommend`,
};
