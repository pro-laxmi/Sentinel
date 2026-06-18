import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
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
import { useAuth } from '../hooks/useAuth';

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ username: '', email: '', bio: '', githubUsername: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('sentinel_token');
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProfile({
            username: data.username || '',
            email: data.email || '',
            bio: data.bio || '',
            githubUsername: data.githubUsername
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    // Check URL for GitHub connection success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('github') === 'connected') {
      setMessage({ type: 'success', text: 'GitHub account linked successfully!' });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error') === 'github_auth_failed') {
      setMessage({ type: 'error', text: 'Failed to connect GitHub account.' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('sentinel_token');
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          bio: profile.bio
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Optional: Update context if needed, but since it's driven by JWT, we might need a new token if username changed, 
        // for now we just show success.
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error while updating profile' });
    } finally {
      setSaving(false);
    }
  };

  const connectGitHub = async () => {
    try {
      const token = localStorage.getItem('sentinel_token');
      const res = await fetch(`${API_BASE_URL}/github/auth`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to initiate GitHub auth' });
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">OPERATOR SETTINGS</h1>
        <p className="text-slate-400">Manage your Sentinel profile and integrations.</p>
      </div>

      {message && (
        <div className={`p-4 rounded border flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : 'bg-red-950/30 border-red-900/50 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">Profile Details</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Username</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Bio / Clearance Info</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors h-24 resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition-colors flex justify-center items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'UPDATING...' : 'UPDATE PROFILE'}
            </button>
          </form>
        </div>

        {/* Integrations */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">Integrations</h2>
          
          <div className="flex-1 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded p-4">
              <div className="flex items-center gap-3 mb-2">
                <GithubIcon className="text-slate-300" size={24} />
                <h3 className="text-lg font-bold text-white">GitHub</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Connect your GitHub account to enable repository tracking, automated incident alerts from commits, and PR analysis.
              </p>
              
              {profile.githubUsername ? (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={16} />
                    <span className="text-emerald-400 font-medium text-sm">Connected as {profile.githubUsername}</span>
                  </div>
                  <button onClick={connectGitHub} className="text-xs text-slate-400 hover:text-white underline">
                    Reconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectGitHub}
                  className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white font-bold py-2 px-4 rounded transition-colors flex justify-center items-center gap-2"
                >
                  <GithubIcon size={18} />
                  CONNECT GITHUB
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
