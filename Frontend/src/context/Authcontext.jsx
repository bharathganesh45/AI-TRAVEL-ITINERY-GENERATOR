import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tripai_token') || localStorage.getItem('voyage_token') || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile(token);
          setUser(res.user);
        } catch (err) {
          console.error('Session restoration failed:', err);
          // Clear local session state without calling logout() to avoid stale closure dependency
          setUser(null);
          setToken('');
          localStorage.removeItem('tripai_token');
          localStorage.removeItem('voyage_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('tripai_token', authToken);
  };

  const logout = () => {
    if (token) {
      authAPI.logout(token);
    }
    setUser(null);
    setToken('');
    localStorage.removeItem('tripai_token');
    localStorage.removeItem('voyage_token');
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
