import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, verifyToken } from '../api/publicAPI/userApi';

const Authorizer = createContext(null);

export const AuthorizerProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const result = await verifyToken();
      if (result.isValid) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await loginApi(credentials);
      // After login, verify and get user data
      await checkAuth();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <Authorizer.Provider value={value}>{children}</Authorizer.Provider>;
};

export const useAuthorizer = () => {
  const context = useContext(Authorizer);
  if (!context) {
    throw new Error('useAuthorizer must be used within an AuthorizerProvider');
  }
  return context;
};
