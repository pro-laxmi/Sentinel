import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // Import the hook
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import LogsPage from './pages/LogsPage';
import LoginPage from './pages/LoginPage';

function App() {
  const { isAuthenticated, loading } = useAuth(); // Get state directly from Context

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-mono animate-pulse">VERIFYING CLEARANCE...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <LoginPage />
        } />
        
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<DashboardPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;