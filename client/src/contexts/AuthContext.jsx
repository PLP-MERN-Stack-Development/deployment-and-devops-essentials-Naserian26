// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useAuth from '../hooks/useAuth';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { token, isAuthenticated } = useAuthStore();
  const { getCurrentUser } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !isAuthenticated) {
        try {
          await getCurrentUser();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []); // Empty dependency array - run only once

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};