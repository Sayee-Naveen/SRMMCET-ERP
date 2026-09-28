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

// Response interceptor: auto-logout on 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('srm_erp_token');
      localStorage.removeItem('srm_erp_role');
      localStorage.removeItem('srm_erp_username');
      localStorage.removeItem('srm_erp_fullname');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
