import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Projects', path: '/my-projects', icon: 'account_tree' },
    { name: 'Tasks', path: '/my-tasks', icon: 'assignment' },
    { name: 'Team', path: '/team-stack', icon: 'group' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#0e0e0e]/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-xl lg:hidden">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={cn(
            "flex flex-col items-center justify-center transition-all active:scale-90 duration-200 py-1 px-4 rounded-xl",
            isActive(item.path)
              ? "text-[#B6A0FF] bg-[#B6A0FF]/10 shadow-[inset_0_1px_0_rgba(182,160,255,0.2)] font-bold"
              : "text-[#cac4d3]/60 opacity-70 hover:text-[#B6A0FF] hover:opacity-100"
          )}
        >
          <span className="material-symbols-outlined mb-1" data-icon={item.icon}>
            {item.icon}
          </span>
          <span className="font-headline text-[10px] uppercase tracking-[0.1em] font-medium">
            {item.name}
          </span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNavBar;
