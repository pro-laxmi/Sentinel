import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // Import the hook
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import LogsPage from './pages/LogsPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';

const HomeRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (localStorage.getItem('sentinel_onboarding')) return <Navigate to="/onboarding" />;
  return <Layout />;
};

const LoginRoute = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    if (localStorage.getItem('sentinel_onboarding')) return <Navigate to="/onboarding" />;
    return <Navigate to="/" />;
  }
  return <LoginPage />;
};

function App() {
  const { isAuthenticated, loading } = useAuth(); // Get state directly from Context

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-mono animate-pulse">VERIFYING CLEARANCE...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRoute isAuthenticated={isAuthenticated} />} />
        
        <Route path="/onboarding" element={
          isAuthenticated ? <OnboardingPage /> : <Navigate to="/login" />
        } />
        
        <Route path="/" element={<HomeRoute isAuthenticated={isAuthenticated} />}>
          <Route index element={<DashboardPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;