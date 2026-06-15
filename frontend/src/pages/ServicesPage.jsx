import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('sentinel_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      const [servicesRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/services`, { headers }),
        fetch(`${API_BASE_URL}/alerts/active`, { headers })
      ]);
      const servicesData = await servicesRes.json();
      const alertsData = await alertsRes.json();
      
      if (servicesData.success) setServices(servicesData.data);
      if (alertsData.success) setAlerts(alertsData.data);
      setLoading(false);
    } catch (error) {
      console.error("Link failed:", error);
    }
  };

  const handleAcknowledge = async (alertId) => {
    const token = localStorage.getItem('sentinel_token');
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/status`, { // Ensure route matches backend
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACKNOWLEDGED' })
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error("Override failed:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const isSystemHealthy = alerts.length === 0;

  if (loading) return <div className="text-emerald-500 font-mono animate-pulse">SCANNING SERVICES...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-white">INFRASTRUCTURE</h1>
          <p className="text-slate-500 mt-1 text-sm">Service health and incident management</p>
        </div>
        <div className={`px-6 py-2 border rounded shadow-lg animate-pulse font-mono font-bold tracking-widest ${
          isSystemHealthy ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' : 'bg-red-950/30 border-red-500 text-red-500'
        }`}>
          {isSystemHealthy ? 'SYSTEM_NOMINAL' : 'ACTIVE_INCIDENT'}
        </div>
      </header>

      <div className="space-y-8">
        {/* Active Alerts */}
        <section className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-ping"></span>
            Active Alerts ({alerts.length})
          </h2>
          {alerts.length === 0 ? (
            <div className="text-slate-500 italic font-mono text-sm">No active carrier errors.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-red-950/40 border border-red-900/50 p-4 rounded flex justify-between items-center hover:bg-red-900/30 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-red-500 bg-red-950 px-2 py-1 rounded mr-3 uppercase">{alert.severity}</span>
                    <span className="text-red-200 font-mono">{alert.title}</span>
                  </div>
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={alert.status === 'ACKNOWLEDGED'}
                    className={`text-xs px-3 py-1 rounded transition-colors border ${alert.status === 'ACKNOWLEDGED' ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'}`}
                  >
                    {alert.status === 'ACKNOWLEDGED' ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Monitored Services Grid (With Uptime Bar) */}
        <section className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Monitored Services</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {services.map(service => {
              const isDown = alerts.some(a => a.log?.serviceId === service.id);
              const recentChecks = [...(service.healthChecks || [])].reverse();

              return (
                <div key={service.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-slate-200 font-medium">{service.title}</h3>
                      <p className="text-xs text-slate-600 font-mono mt-1">{service.url}</p>
                    </div>
                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded ${isDown ? 'text-red-500 bg-red-950/50 border border-red-900' : 'text-emerald-500 bg-emerald-950/50 border border-emerald-900'}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${isDown ? 'bg-red-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_1px_rgba(16,185,129,0.5)]'}`}></span>
                      {isDown ? 'DOWN' : 'UP'}
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono uppercase tracking-widest">
                      <span>Health History</span>
                      <span>Now</span>
                    </div>
                    <div className="flex space-x-[2px] h-6 w-full items-end overflow-hidden">
                      {recentChecks.map(check => {
                        const isHealthy = check.status === 'HEALTHY';
                        const height = isHealthy ? Math.max(20, Math.min(100, (check.responseTimeMs / 1000) * 100)) : 100;
                        return (
                          <div 
                            key={check.id}
                            title={`${new Date(check.createdAt).toLocaleTimeString()} | ${check.status} | ${check.responseTimeMs}ms`}
                            className={`flex-1 rounded-sm opacity-80 hover:opacity-100 cursor-crosshair ${isHealthy ? 'bg-emerald-600' : 'bg-red-500'}`}
                            style={{ height: isHealthy ? `${height}%` : '100%' }}
                          ></div>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 40 - recentChecks.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex-1 bg-slate-800/50 rounded-sm h-1/3"></div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default ServicesPage;