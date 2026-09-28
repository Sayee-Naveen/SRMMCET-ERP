import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('srm_erp_token');
    const role = localStorage.getItem('srm_erp_role');
    const username = localStorage.getItem('srm_erp_username');
    const fullName = localStorage.getItem('srm_erp_fullname');

    if (token && role && username) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired, clear storage
          localStorage.removeItem('srm_erp_token');
          localStorage.removeItem('srm_erp_role');
          localStorage.removeItem('srm_erp_username');
          localStorage.removeItem('srm_erp_fullname');
          setUser(null);
        } else {
          setUser({ token, role, username, fullName });
        }
      } catch (e) {
        setUser({ token, role, username, fullName });
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('srm_erp_token', userData.access_token);
    localStorage.setItem('srm_erp_role', userData.role);
    localStorage.setItem('srm_erp_username', userData.username);
    localStorage.setItem('srm_erp_fullname', userData.full_name);

    setUser({
      token: userData.access_token,
      role: userData.role,
      username: userData.username,
      fullName: userData.full_name
    });
  };

  const logout = () => {
    localStorage.removeItem('srm_erp_token');
    localStorage.removeItem('srm_erp_role');
    localStorage.removeItem('srm_erp_username');
    localStorage.removeItem('srm_erp_fullname');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
