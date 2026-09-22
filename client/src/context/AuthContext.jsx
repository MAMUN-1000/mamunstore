import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

// 1. Create the Context object
const AuthContext = createContext(null);

// 2. Custom hook to consume the AuthContext easily in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. AuthProvider component that wraps our app and broadcasts auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true initially while checking active cookie session
  const [error, setError] = useState(null);

  // Check if an active session exists when the app first loads in the browser
  const checkUserSession = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/auth/me');
      setUser(res.data.data.user);
    } catch (err) {
      // 401 Unauthorized simply means no active session cookie exists yet
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const loggedInUser = res.data.data.user;
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/register', { name, email, password });
      const newUser = res.data.data.user;
      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkUserSession,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
