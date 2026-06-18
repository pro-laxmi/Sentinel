import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, ScrollText, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Inside the Sidebar component:
const Sidebar = () => {
  const { logout, user } = useAuth(); // Grab logout and user from context

  const handleLogout = () => {
    logout(); // Let context handle deleting the token and state
  };
  const initials = user?.username 
    ? user.username.substring(0, 2).toUpperCase() 
    : 'OP';

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Services & Alerts', path: '/services', icon: <Server size={20} /> },
    { name: 'Telemetry Logs', path: '/logs', icon: <ScrollText size={20} /> },
    { name: 'Settings', path: '/settings', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen text-slate-300 font-sans z-20 relative">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <ShieldAlert className="text-emerald-500 mr-3 animate-pulse" size={28} />
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white">SENTINEL</h1>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">Core_V1</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' 
                  : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
              }`
            }
          >
            {link.icon}
            <span className="ml-3 font-medium text-sm">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center mb-4 px-2">
          
          {/* Dynamic Avatar */}
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
            {initials}
          </div>
          
          {/* Dynamic Text */}
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.username || 'Unknown User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'No email provided'}
            </p>
          </div>

        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-xs font-bold tracking-widest text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded transition-colors"
        >
          <LogOut size={14} className="mr-2" />
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
};

export default Sidebar;