import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';
import IncidentModal from '../components/IncidentModal';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const isAdminOrCommander = user?.role === 'ADMIN' || user?.role === 'COMMANDER';

  const fetchData = async () => {
    const token = localStorage.getItem('sentinel_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [alertsRes, incidentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/alerts/open`, { headers }),
        fetch(`${API_BASE_URL}/incidents`, { headers })
      ]);
      const alertsData = await alertsRes.json();
      const incidentsData = await incidentsRes.json();
      
      if (alertsData.success) setAlerts(alertsData.data);
      if (incidentsData.success) setIncidents(incidentsData.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleEscalationSuccess = () => {
    setSelectedAlert(null);
    fetchData(); // Refresh data to move the alert to an incident
  };

  if (loading) return <div className="text-emerald-500 font-mono animate-pulse">LOADING DASHBOARD...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold tracking-widest text-white">COMMAND OVERVIEW</h1>
        <p className="text-slate-500 mt-1 text-sm">System-wide metrics and aggregates</p>
      </header>
      
      <div className="space-y-8">
        {/* Active Alerts */}
        <section className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-ping"></span>
            Open Alerts ({alerts.length})
          </h2>
          {alerts.length === 0 ? (
            <div className="text-slate-500 italic font-mono text-sm">No open alerts. System Nominal.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-red-950/40 border border-red-900/50 p-4 rounded flex justify-between items-center hover:bg-red-900/30 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-red-500 bg-red-950 px-2 py-1 rounded mr-3 uppercase">{alert.severity}</span>
                    <span className="text-red-200 font-mono font-bold mr-2">{alert.title}</span>
                    {alert.log?.service && (
                      <span className="text-slate-400 text-xs border border-slate-700 px-2 py-0.5 rounded ml-2">
                        {alert.log.service.title}
                      </span>
                    )}
                  </div>
                  {isAdminOrCommander && (
                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      className="bg-red-900 hover:bg-red-800 text-red-200 border border-red-700 text-xs px-3 py-1.5 rounded font-bold tracking-wide transition-colors"
                    >
                      ACKNOWLEDGE & ESCALATE
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Incidents */}
        <section className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-3 animate-pulse"></span>
            Active Incidents ({incidents.length})
          </h2>
          {incidents.length === 0 ? (
            <div className="text-slate-500 italic font-mono text-sm">No active incidents assigned to you or open.</div>
          ) : (
            <div className="space-y-3">
              {incidents.map(incident => (
                <div key={incident.id} className="bg-slate-950 border border-slate-800 p-4 rounded flex justify-between items-center hover:border-slate-700 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-orange-500 bg-orange-950/50 border border-orange-900 px-2 py-1 rounded mr-3 uppercase">{incident.status}</span>
                    <span className="text-slate-200 font-medium">{incident.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Target: {incident.slaTarget ? new Date(incident.slaTarget).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedAlert && (
        <IncidentModal 
          alert={selectedAlert} 
          onClose={() => setSelectedAlert(null)}
          onEscalate={handleEscalationSuccess}
        />
      )}
    </motion.div>
  );
};

export default DashboardPage;