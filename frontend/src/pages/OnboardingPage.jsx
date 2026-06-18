import { useNavigate } from 'react-router-dom';
import { ArrowRight, SkipForward } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const GithubIcon = ({ className, size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);
import { motion } from 'framer-motion';

const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleSkip = () => {
    localStorage.removeItem('sentinel_onboarding');
    navigate('/');
  };

  const connectGitHub = async () => {
    try {
      const token = localStorage.getItem('sentinel_token');
      const res = await fetch(`${API_BASE_URL}/github/auth`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) {
        // We can clear the onboarding flag before redirecting to GitHub,
        // so when they come back to /settings?github=connected, they don't get stuck in onboarding.
        localStorage.removeItem('sentinel_onboarding');
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to initiate GitHub auth', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-lg p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-teal-400"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">WELCOME TO SENTINEL</h1>
          <p className="text-sm text-slate-400">Initialize your environment by linking your integrations.</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 mb-8 text-center">
          <GithubIcon className="mx-auto text-emerald-500 mb-4" size={48} />
          <h2 className="text-lg font-bold text-white mb-2">Connect GitHub</h2>
          <p className="text-xs text-slate-400 mb-6">
            Link your repository to enable commit tracking, automated incident alerts, and deployment monitoring.
          </p>
          <button 
            onClick={connectGitHub}
            className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white font-bold py-3 px-4 rounded transition-colors flex justify-center items-center gap-2"
          >
            <GithubIcon size={20} />
            AUTHORIZE GITHUB
          </button>
        </div>

        <button 
          onClick={handleSkip}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium tracking-wider"
        >
          SKIP INITIALIZATION <SkipForward size={16} />
        </button>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
