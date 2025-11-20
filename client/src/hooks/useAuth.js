import { useState, useCallback } from 'react';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const useAuth = () => {
  const [loading, setLoading] = useState(false);

  // Get state and actions from the store
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);

  // Register a new user
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      login(response.user, response.token);
      toast.success('Registration successful');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Login user
  const loginUser = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      login(response.user, response.token);
      toast.success('Login successful');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Logout user
  const logoutUser = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
  }, [logout]);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    if (!token) return { success: false };

    setLoading(true);
    try {
      const response = await authService.getCurrentUser();
      useAuthStore.getState().updateUser(response.user);
      return { success: true };
    } catch (error) {
      logout();
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user info'
      };
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    register,
    loginUser,
    logoutUser,
    getCurrentUser
  };
};

export default useAuth;
