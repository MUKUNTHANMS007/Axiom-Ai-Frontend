import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onDeploy }: { onDeploy?: () => void }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'My Profile', path: '/me', icon: 'account_circle' },
    { name: 'My Projects', path: '/my-projects', icon: 'workspaces' },
    { name: 'My Tasks', path: '/my-tasks', icon: 'task_alt' },
    { name: 'Architecture', path: '/recommendations', icon: 'architecture' },
    { name: 'Team Stack', path: '/team-stack', icon: 'groups' },
    { name: 'Workflow', path: '/workflow', icon: 'timeline' },
    { name: 'History', path: '/history', icon: 'history' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-border bg-background flex flex-col p-4 gap-2 z-50 transition-colors duration-500">
      <div className="mb-8 px-2">
        <h2 className="font-headline font-bold text-lg tracking-tight text-foreground">Project Alpha</h2>
        <p className="text-xs text-muted-foreground font-label">VPC Infrastructure</p>
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
        <button 
          onClick={onDeploy}
          className="mb-4 w-full py-2.5 px-4 bg-primary text-on-primary-container font-label text-xs font-bold uppercase tracking-widest rounded-md hover:bg-primary-fixed transition-all duration-300"
        >
          Deploy Stack
        </button>
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 transition-colors font-label text-sm ${
            isActive('/settings') 
              ? 'bg-white/10 text-white rounded-lg font-semibold' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-lg" data-icon="settings">settings</span>
          <span>Settings</span>
        </Link>
        <Link
          to="/docs"
          className={`flex items-center gap-3 px-3 py-2 transition-colors font-label text-sm ${
            isActive('/docs') 
              ? 'bg-white/10 text-white rounded-lg font-semibold' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-lg" data-icon="menu_book">menu_book</span>
          <span>Docs</span>
        </Link>
        <a className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors font-label text-sm" href="#">
          <span className="material-symbols-outlined text-lg" data-icon="support_agent">support_agent</span>
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
