import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Architecture', path: '/recommendations', icon: 'architecture' },
    { name: 'Integrations', path: '#', icon: 'hub' },
    { name: 'Analytics', path: '#', icon: 'insights' },
    { name: 'History', path: '/history', icon: 'history' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-white/5 bg-[#000000] flex flex-col p-4 gap-2 z-50">
      <div className="mb-8 px-2">
        <h2 className="font-headline font-bold text-lg tracking-tight text-white">Project Alpha</h2>
        <p className="text-xs text-slate-500 font-label">VPC Infrastructure</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navLinks.map((link) => (
          link.path === '#' ? (
            <a 
              key={link.name}
              className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors font-label text-sm" 
              href="#"
            >
              <span className="material-symbols-outlined text-xl" data-icon={link.icon}>{link.icon}</span>
              <span>{link.name}</span>
            </a>
          ) : (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors font-label text-sm ${
                isActive(link.path) 
                  ? 'bg-white/10 text-white rounded-lg font-semibold' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-xl" data-icon={link.icon}>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          )
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <button className="mb-4 w-full py-2.5 px-4 bg-primary text-on-primary-container font-label text-xs font-bold uppercase tracking-widest rounded-md hover:bg-primary-fixed transition-all duration-300">
          Deploy Stack
        </button>
        <a className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors font-label text-sm" href="#">
          <span className="material-symbols-outlined text-lg" data-icon="menu_book">menu_book</span>
          <span>Docs</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors font-label text-sm" href="#">
          <span className="material-symbols-outlined text-lg" data-icon="support_agent">support_agent</span>
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
