import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('srm_ec_token');
    const storedUser = localStorage.getItem('srm_ec_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
        localStorage.removeItem('srm_ec_token');
        localStorage.removeItem('srm_ec_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await API.post('/login', { username, password });
    const { access_token, role, full_name, department } = res.data;

    const userData = { username, role, full_name, department };
    localStorage.setItem('srm_ec_token', access_token);
    localStorage.setItem('srm_ec_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('srm_ec_token');
    localStorage.removeItem('srm_ec_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
