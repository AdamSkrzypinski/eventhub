import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '@eventhub/shared';

interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);

    // Sprawdzenie wygaśnięcia tokenu
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('eventhub_token')
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedToken = localStorage.getItem('eventhub_token');
    return savedToken ? decodeJwtPayload(savedToken) : null;
  });

  useEffect(() => {
    if (token) {
      const decoded = decodeJwtPayload(token);
      if (decoded) {
        setUser(decoded);
        localStorage.setItem('eventhub_token', token);
      } else {
        logout();
      }
    } else {
      setUser(null);
      localStorage.removeItem('eventhub_token');
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('eventhub_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musi być używane wewnątrz AuthProvider');
  }
  return context;
}