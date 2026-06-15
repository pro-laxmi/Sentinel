import { useContext } from 'react';
import { AuthContext } from '../../../context/authContext';

// Custom hook to easily access auth state anywhere in your app
export const useAuth = () => {
  return useContext(AuthContext);
};