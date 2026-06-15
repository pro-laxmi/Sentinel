import { Terminal, ShieldAlert } from 'lucide-react';

export default function AuthCard({ isLogin, error, children, onToggleMode }) {
  return (
    <div className="relative w-full max-w-md bg-[#0d1117]/80 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-2xl p-8 overflow-hidden font-mono">
      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-colors duration-500 ${isLogin ? 'bg-blue-500' : 'bg-emerald-500'}`} />
      
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <Terminal className={`w-5 h-5 ${isLogin ? 'text-blue-500' : 'text-emerald-500'}`} />
          <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">SYSTEM CONTROL</span>
        </div>
        <div className="flex space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">
        {isLogin ? 'AUTHENTICATE_SESSION' : 'PROVISION_NEW_AGENT'}
      </h2>
      <p className="text-xs text-slate-500 mb-6">
        {isLogin ? 'Provide credential tokens to enter core network.' : 'Generate localized access keys.'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-red-400 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {children}

      <div className="mt-6 pt-4 border-t border-slate-800/40 text-center text-xs text-slate-500">
        {isLogin ? "LACKING_CLEARANCE? " : "SYSTEMS_PROVISIONED? "}
        <button 
          type="button"
          onClick={onToggleMode}
          className={`font-bold transition-colors ${isLogin ? 'text-blue-400 hover:text-blue-300' : 'text-emerald-400 hover:text-emerald-300'}`}
        >
          {isLogin ? 'REQUEST_ACCESS' : 'RETURN_TO_BASE'}
        </button>
      </div>
    </div>
  );
}