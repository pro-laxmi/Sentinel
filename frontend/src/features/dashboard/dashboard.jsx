import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../auth/hooks/useAuth';

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 font-mono p-8 selection:bg-blue-500/30 selection:text-blue-400">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold tracking-tight">SENTINEL_CORE_OPERATIONS</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-950/40 hover:bg-red-900/40 border border-red-800/60 text-red-400 text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>TERMINATE_SESSION</span>
          </button>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#0d1117] border border-slate-800 rounded-xl">
            <h3 className="text-sm text-slate-400 mb-2 font-bold">SYSTEMS_HEALTH</h3>
            <p className="text-2xl text-emerald-400 font-bold">100% ONLINE</p>
          </div>
          <div className="p-6 bg-[#0d1117] border border-slate-800 rounded-xl">
            <h3 className="text-sm text-slate-400 mb-2 font-bold">ACTIVE_INCIDENTS</h3>
            <p className="text-2xl text-slate-500 font-bold">0 CARRIER_ERRORS</p>
          </div>
          <div className="p-6 bg-[#0d1117] border border-slate-800 rounded-xl">
            <h3 className="text-sm text-slate-400 mb-2 font-bold">LOG_STREAM</h3>
            <p className="text-xs text-blue-400 animate-pulse mt-2">LISTENING_ON_SOCKET_PORT_8000...</p>
          </div>
        </main>
      </div>
    </div>
  );
}