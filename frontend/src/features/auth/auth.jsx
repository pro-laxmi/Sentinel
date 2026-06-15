import { useState } from 'react';
import { User, Lock, Cpu, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { API_BASE_URL } from '../../services/api';
import AuthCard from './components/authCard';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function Auth() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // New state for password toggle
  const [formData, setFormData] = useState({ email: '', username: '', password: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
    
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowPassword(false); // Reset password visibility on toggle
    setFormData({ email: '', username: '', password: '', bio: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
    // If logging in, we don't need to send the email or bio to the backend
    const payload = isLogin 
      ? { username: formData.username, password: formData.password }
      : formData;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Operation failed');

      if (isLogin) {
        login(data.token);
      } else {
        setIsLogin(true);
        setFormData({ email: '', username: '', password: '', bio: '' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthCard isLogin={isLogin} error={error} onToggleMode={toggleMode}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email only shows on Signup */}
          {!isLogin && (
            <Input 
              icon={Mail}
              type="email"
              placeholder="operator_email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          )}

          <Input 
            icon={User}
            type="text"
            placeholder="operator_username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />

          {!isLogin && (
            <Input 
              icon={Cpu}
              type="text"
              placeholder="operator_bio_metadata (optional)"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          )}

          {/* Password field with absolute positioned toggle button */}
          <div className="relative">
            <Input 
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="security_passphrase"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button 
            type="submit" 
            variant={isLogin ? 'primary' : 'secondary'} 
            loading={loading}
          >
            {isLogin ? 'EXECUTE_LOGIN' : 'COMPILE_REGISTRATION'}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}