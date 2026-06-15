import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';

const Layout = () => {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* 1. The Persistent Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 relative overflow-y-auto">
        
        {/* Background Animations (Moved here so they persist across pages) */}
        <motion.div 
          className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(0,0,0,0))] pointer-events-none z-0"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        />
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

        {/* The active page content gets injected here */}
        <div className="relative z-10 p-8 min-h-full">
          <Outlet /> 
        </div>

      </div>
    </div>
  );
};

export default Layout;