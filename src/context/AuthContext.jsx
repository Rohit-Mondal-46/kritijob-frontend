import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import safeStorage from '../utils/safeStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = safeStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined') {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      safeStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(safeStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate and sync user session on mount/token change
  useEffect(() => {
     if (token) {
         api.get('/auth/me')
            .then(res => {
                setUser(res.data.data);
                safeStorage.setItem('user', JSON.stringify(res.data.data));
            })
            .catch(() => logout());
     }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password }, { skipGlobalToast: true });
      
      safeStorage.setItem('token', data.token);
      let userData = data.user;
      
      safeStorage.setItem('user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password, role, phone, autoLogin = true, companyType = 'company') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password, role, phone, companyType, company_type: companyType }, { skipGlobalToast: true });

      if (autoLogin && !data.requiresVerification) {
        safeStorage.setItem('token', data.token);
        const userData = data.user;
        
        safeStorage.setItem('user', JSON.stringify(userData));
        setToken(data.token);
        setUser(userData);
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/verify-email', { email, otp }, { skipGlobalToast: true });
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Email verification failed');
      setLoading(false);
      throw err;
    }
  };

  const resendVerificationOTP = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/resend-verification-otp', { email }, { skipGlobalToast: true });
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    safeStorage.removeItem('token');
    safeStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Optional: Call logout endpoint
    // api.get('/auth/logout').catch(err => console.error(err)); 
    
    // REMOVED: window.location.href = '/login';
    // Let the component handle the redirect instead
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, verifyEmail, resendVerificationOTP, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};