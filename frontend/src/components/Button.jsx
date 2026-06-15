export default function Button({ children, variant = 'primary', loading, ...props }) {
  const baseStyles = "w-full font-bold text-xs tracking-widest uppercase py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 text-slate-950";
  
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    secondary: "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    danger: "bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]}`} 
      disabled={loading}
      {...props}
    >
      {loading ? 'PROCESSING...' : children}
    </button>
  );
}