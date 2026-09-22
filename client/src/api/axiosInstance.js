import axios from 'axios';

// Create a pre-configured Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial: allows browser to send and receive HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
