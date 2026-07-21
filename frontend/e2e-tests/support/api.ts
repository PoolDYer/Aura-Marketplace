import axios from 'axios';

export const apiBaseURL = process.env.E2E_API_URL || 'http://127.0.0.1:3001';

export const api = axios.create({
  baseURL: apiBaseURL,
});

