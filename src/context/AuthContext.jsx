import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // You might want to validate user session on mount
  useEffect(() => {
     if(token && !user) {
         // Optionally fetch profile
         api.get('/auth/me')
            .then(res => setUser(res.data.data))
            .catch(() => logout());
     }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      let userData = data.user;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password, role, autoLogin = true) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password, role });

      if (autoLogin && !data.requiresVerification) {
        localStorage.setItem('token', data.token);
        const userData = data.user;
        
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(data.token);
        setUser(userData);
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/verify-email', { email, otp });
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
      const { data } = await api.post('/auth/resend-verification-otp', { email });
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Optional: Call logout endpoint
    // api.get('/auth/logout').catch(err => console.error(err)); 
    
    // REMOVED: window.location.href = '/login';
    // Let the component handle the redirect instead
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, verifyEmail, resendVerificationOTP, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};