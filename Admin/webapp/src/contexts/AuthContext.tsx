import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, isAuthenticated } from '@/lib/api';
import type { LoginRequest } from '@/types/api';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  userEmail: string | null;
  userRole: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      const storedEmail = localStorage.getItem('fts_email');
      const storedRole = localStorage.getItem('fts_role');
      if (storedEmail) setUserEmail(storedEmail);
      if (storedRole) setUserRole(storedRole);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      if (response.success) {
        setIsLoggedIn(true);
        setUserEmail(response.email);
        setUserRole(response.role);
        localStorage.setItem('fts_email', response.email);
        localStorage.setItem('fts_role', response.role);
      } else {
        throw new Error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserRole(null);
    localStorage.removeItem('fts_email');
    localStorage.removeItem('fts_role');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, userEmail, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
