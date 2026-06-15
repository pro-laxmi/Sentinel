import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // <-- Add user state
  const [loading, setLoading] = useState(true);

  // Helper function to extract data from the JWT
  const decodeAndSetUser = (token) => {
    try {
      // A JWT is split by dots. The payload is the second part [1].
      // atob() decodes the base64 string into readable JSON.
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      setUser({
        username: payload.username || 'Operator', // Fallback if missing
        email: payload.email || 'admin@sentinel.core'
      });
    } catch (error) {
      console.error("Failed to decode token", error);
      setUser({ username: 'Operator', email: 'admin@sentinel.core' });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('sentinel_token');
    if (token) {
      setIsAuthenticated(true);
      decodeAndSetUser(token); // Decode on page refresh
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('sentinel_token', token);
    setIsAuthenticated(true);
    decodeAndSetUser(token); // Decode on fresh login
  };

  const logout = () => {
    localStorage.removeItem('sentinel_token');
    setIsAuthenticated(false);
    setUser(null); // Clear user on logout
  };

  return (
    // Export the 'user' object so the Sidebar can use it
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};