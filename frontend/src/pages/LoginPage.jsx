import { useState } from 'react';
import { User, Lock, Cpu, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion'; 
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../services/api';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import Button from '../components/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
    
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowPassword(false);
    setFormData({ email: '', username: '', password: '', bio: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const payload = isLogin ? { username: formData.username, password: formData.password } : formData;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Operation failed');

      if (isLogin) {
        login(data.token); // <--- Triggers Context to update the whole app
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(0,0,0,0))] relative overflow-hidden text-slate-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_30%,#000_70%,transparent_100%)]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full flex justify-center px-4"
      >
        <AuthCard isLogin={isLogin} error={error} onToggleMode={toggleMode}>
          <motion.form layout onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <Input icon={Mail} type="email" placeholder="operator_email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </motion.div>
            )}

            <Input icon={User} type="text" placeholder="operator_username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />

            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <Input icon={Cpu} type="text" placeholder="operator_bio_metadata (optional)" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
              </motion.div>
            )}

            <div className="relative">
              <Input icon={Lock} type={showPassword ? "text" : "password"} placeholder="security_passphrase" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" variant={isLogin ? 'primary' : 'secondary'} loading={loading}>
              {isLogin ? 'EXECUTE_LOGIN' : 'COMPILE_REGISTRATION'}
            </Button>
          </motion.form>
        </AuthCard>
      </motion.div>
    </div>
  );
}