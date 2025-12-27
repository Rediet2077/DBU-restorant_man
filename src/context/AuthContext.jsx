import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/check_session.php', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success) {
            setUser(userData.user);
          } else {
            setUser(null);
          }
        } else {
          throw new Error('Session check failed');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to verify session. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    error,
    login: async (username, password) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success) {
            setUser(userData.user);
            return { success: true };
          } else {
            throw new Error(userData.message || 'Login failed');
          }
        } else {
          throw new Error('Login request failed');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError(err.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    logout: async () => {
      try {
        await fetch('/api/logout.php', {
          method: 'POST',
          credentials: 'include'
        });
        setUser(null);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};