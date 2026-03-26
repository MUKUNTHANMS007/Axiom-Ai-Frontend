import { Link } from 'react-router-dom';

const TopBar = () => {
  return (
    <header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-40 backdrop-blur-xl bg-[#060e20] border-b border-white/10">
      <Link to="/" className="text-xl font-headline font-bold tracking-tighter text-[#b6a0ff]">ArchIntel</Link>
      <nav className="hidden md:flex items-center gap-8 font-label text-sm tracking-tight font-medium">
        <a className="text-slate-400 hover:text-white transition-colors" href="#">Explorer</a>
        <a className="text-slate-400 hover:text-white transition-colors" href="#">Team Stack</a>
        <a className="text-slate-400 hover:text-white transition-colors" href="#">Settings</a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
          <img 
            alt="User Profile Avatar" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuColJ-iyXL9VAq62R-8lxVgsrV6Sg1HalpV8z-shE7p2j7l74GeG1-zaIdqkAmpGJ-MoZmxEa6JIeF52szJX73cgVlbvVdrPoity_C30iBy7rhzvfS2A2v3M4Quh4jxuD8Q5UCVME-Rv6a8HGhUA8_C_HqHN2vY5BCD8zNQIx5ITxSi3N-B1j5wbnkmQbTbo9ppYRuH728hf_6_ejPqaARLr9L_wM99ATOP3va0cdtkukipmwo8H3atW4tUqCgEGC4TpqYq7arSZHo"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
