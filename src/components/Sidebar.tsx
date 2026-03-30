import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onDeploy?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ onDeploy, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'My Projects', path: '/my-projects', icon: 'workspaces' },
    { name: 'My Tasks', path: '/my-tasks', icon: 'task_alt' },
    { name: 'Architecture', path: '/architecture', icon: 'architecture' },
    { name: 'Team Stack', path: '/team-stack', icon: 'groups' },
    { name: 'Workflow', path: '/workflow', icon: 'timeline' },
    { name: 'History', path: '/history', icon: 'history' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
    { name: 'Docs', path: '/docs', icon: 'menu_book' },
    { name: 'Support', path: '/support', icon: 'support_agent' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={cn(
        "h-screen w-64 fixed top-0 border-r border-border bg-background flex flex-col p-4 pb-32 lg:pb-4 gap-2 z-[60] transition-all duration-300 transform lg:translate-x-0 lg:left-0 overflow-y-auto no-scrollbar",
        isOpen ? "translate-x-0 left-0" : "-translate-x-full left-[-256px]"
      )}>
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0a0a0b] border border-white/5 shadow-lg shadow-primary/10">
          <img src="/axiom-logo.png" alt="Axiom AI" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="font-headline font-bold text-lg tracking-tight text-white uppercase leading-none">Axiom <span className="text-primary">AI</span></h2>
          <p className="text-[10px] text-slate-500 font-label uppercase tracking-widest mt-1">Control Panel</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {navLinks.map((link) => (
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
        ))}
      </nav>
      <div className="mt-auto">
        <button 
          onClick={onDeploy}
          className="w-full py-2.5 px-4 bg-primary text-black font-label text-xs font-bold uppercase tracking-widest rounded-md hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
        >
          Export Blueprint
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
