import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Attach Authorization header if JWT token exists in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('srm_erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
