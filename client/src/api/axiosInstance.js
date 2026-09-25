import axios from 'axios';

// Normalize API base URL:
// 1. If VITE_API_URL is configured, trim whitespace and strip any trailing slash.
// 2. In local Vite development (import.meta.env.DEV), default to local server http://localhost:5000/api.
// 3. In production, default to relative '/api' to support Vercel same-domain proxy rewrites.
const rawBaseURL = import.meta.env.VITE_API_URL;
const baseURL =
  rawBaseURL && typeof rawBaseURL === 'string' && rawBaseURL.trim()
    ? rawBaseURL.trim().replace(/\/+$/, '')
    : import.meta.env.DEV
      ? 'http://localhost:5000/api'
      : '/api';

// Create a pre-configured Axios instance
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Crucial: allows browser to send and receive HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
