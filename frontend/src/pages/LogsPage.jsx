import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const token = localStorage.getItem('sentinel_token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setLogs(data.data);
    } catch (error) {
      console.error("Log sync failed:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold tracking-widest text-white">TELEMETRY STREAM</h1>
        <p className="text-slate-500 mt-1 text-sm">Raw historical logging and system outputs</p>
      </header>

      <section className="bg-[#0a0a0a]/90 backdrop-blur-md border border-slate-800 rounded-lg overflow-hidden h-[75vh] flex flex-col shadow-2xl">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Master Log</h2>
          <span className="text-xs text-emerald-500 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            LIVE
          </span>
        </div>
        
        <div className="p-6 font-mono text-sm space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {logs.map(log => (
            <div key={log.id} className="flex space-x-4 opacity-80 hover:opacity-100 hover:bg-slate-900/50 p-1 rounded transition-all">
              <span className="text-slate-500 shrink-0 border-r border-slate-800 pr-4">
                {new Date(log.createdAt).toLocaleString()}
              </span>
              <span className={`font-bold w-16 shrink-0 ${
                log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-emerald-500'
              }`}>
                [{log.level}]
              </span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default LogsPage;