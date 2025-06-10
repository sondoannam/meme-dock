import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthService } from '../../services/auth';
import { authApi } from '../../api/auth-client';

// Define the context shape
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAdminAccess: () => Promise<boolean>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the provider props
interface UserProviderProps {
  children: React.ReactNode;
}

// UserProvider component
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check if the user is logged in on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAdmin(currentUser.isAdmin);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.login(email, password);
      if (user) {
        setUser(user);
        setIsAdmin(user.isAdmin);

        // Verify API access with JWT
        if (user.isAdmin) {
          await checkAdminAccess();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has API access with admin role
  const checkAdminAccess = async (): Promise<boolean> => {
    try {
      const { authenticated, isAdmin } = await authApi.checkAdminStatus();
      setIsAdmin(authenticated && isAdmin);
      return authenticated && isAdmin;
    } catch (error) {
      console.error('Failed to check admin API access:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Value object for the context
  const value = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin,
    login,
    logout,
    checkAdminAccess,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
