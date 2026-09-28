import axios from 'axios';

// By default connecting to port 8001 so both main ERP (8000) and this module can run concurrently, or port 8000 if configured
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('srm_ec_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
export { API_BASE_URL };
