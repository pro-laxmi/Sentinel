import { motion } from 'framer-motion';

const DashboardPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold tracking-widest text-white">COMMAND OVERVIEW</h1>
        <p className="text-slate-500 mt-1 text-sm">System-wide metrics and aggregates will deploy here.</p>
      </header>
      
      <div className="h-64 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-600 font-mono text-sm">
        [ DASHBOARD MODULES PENDING DEPLOYMENT ]
      </div>
    </motion.div>
  );
};

export default DashboardPage;