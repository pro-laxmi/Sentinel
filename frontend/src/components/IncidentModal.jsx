import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

const IncidentModal = ({ alert, onClose, onEscalate }) => {
  const [title, setTitle] = useState(`[ESCALATION] ${alert.title}`);
  const [status, setStatus] = useState('OPEN');
  const [slaTarget, setSlaTarget] = useState('');
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [users, setUsers] = useState([]);
  const [assignees, setAssignees] = useState([]);

  useEffect(() => {
    // Default to exactly 30 minutes from Date.now()
    const target = new Date(Date.now() + 30 * 60000);
    // Format to datetime-local expected string (YYYY-MM-DDThh:mm)
    // We adjust for local timezone offset
    const offset = target.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(target - offset)).toISOString().slice(0, 16);
    setSlaTarget(localISOTime);

    // Fetch Teams and Users
    const fetchSelectData = async () => {
      try {
        const token = localStorage.getItem('sentinel_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [teamsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/teams`, { headers }),
          fetch(`${API_BASE_URL}/users`, { headers })
        ]);
        
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData.data || []);
        }
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }
      } catch (err) {
        console.error("Failed to load select options", err);
      }
    };

    fetchSelectData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('sentinel_token');
    
    // Parse slaTarget to UTC if it exists
    const finalSlaTarget = slaTarget ? new Date(slaTarget).toISOString() : null;

    const payload = {
      alertId: alert.id,
      title,
      status,
      slaTarget: finalSlaTarget,
      teamId: teamId || null,
      assignees
    };

    try {
      const res = await fetch(`${API_BASE_URL}/incidents/escalate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onEscalate();
      } else {
        console.error("Escalation failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssigneeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setAssignees(selectedOptions);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-lg w-full p-6 text-slate-200"
      >
        <h2 className="text-xl font-bold mb-4 text-white">Declare Incident</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Incident Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="IDENTIFIED">IDENTIFIED</option>
                <option value="MONITORING">MONITORING</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">SLA Target</label>
              <input 
                type="datetime-local" 
                value={slaTarget}
                onChange={(e) => setSlaTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Team Assignment (Optional)</label>
            <select 
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
            >
              <option value="">-- None --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Individual Assignees (Optional)</label>
            <select 
              multiple 
              value={assignees}
              onChange={handleAssigneeChange}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none h-24"
            >
              {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              ESCALATE INCIDENT
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default IncidentModal;
