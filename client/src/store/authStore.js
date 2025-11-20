import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      
      login: (userData, token) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
          loading: false
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setToken: (token) => {
        set({ token });
      },
      
      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },
      
      setLoading: (loading) => {
        set({ loading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // Set loading to false after rehydration
        if (state) {
          state.loading = false;
        }
      }
    }
  )
);

export default useAuthStore;