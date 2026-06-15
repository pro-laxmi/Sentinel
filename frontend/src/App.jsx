import { AuthProvider } from './context/authContext';
import { useAuth } from './features/auth/hooks/useAuth';
import Auth from './features/auth/auth';
import Dashboard from './features/dashboard/dashboard';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0a0c10] text-slate-500 flex items-center justify-center font-mono">LOADING_SYSTEMS...</div>;
  }

  // Traffic Control: If not logged in, show Auth. Otherwise, show Dashboard.
  return isAuthenticated ? <Dashboard /> : <Auth />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}