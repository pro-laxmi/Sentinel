export default function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
      )}
      <input
        className="w-full bg-[#07090e] border border-slate-800 text-slate-200 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all placeholder:text-slate-600"
        {...props}
      />
    </div>
  );
}