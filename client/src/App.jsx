import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './store/authStore';
import authService from './services/authService';

// Layouts
import AuthLayout from './components/Layout/AuthLayout';
import ChatLayout from './components/Layout/ChatLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

// Components
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  // State for initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Zustand store
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const setUser = useAuthStore(state => state.setUser);
  const setToken = useAuthStore(state => state.setToken);
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);

  // Initialize auth once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          const response = await authService.getCurrentUser();
          setUser(response.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true); // ✅ mark initialization done
      }
    };

    initializeAuth();
  }, []); // run only once

  // Show loading spinner until auth check is complete
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Auth check after initialization
  const isUserAuthenticated = isAuthenticated && !!user;

  return (
    <div className="App">
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isUserAuthenticated
              ? <Navigate to="/chat" replace />
              : <Navigate to="/auth/login" replace />
          }
        />

        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Chat route (protected inline) */}
        <Route
          path="/chat"
          element={
            isUserAuthenticated ? <ChatLayout /> : <Navigate to="/auth/login" replace />
          }
        >
          <Route index element={<Chat />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
