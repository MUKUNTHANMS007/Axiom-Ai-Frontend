import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPendingInvites, respondToInvite, type ProjectInvite } from '../services/api';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('vibe_session') || '{}').user;

  useEffect(() => {
    if (user?.name) {
      loadInvites();
      // Poll for invites every 30s
      const interval = setInterval(loadInvites, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.name]);

  const loadInvites = async () => {
    try {
      if (!user?.name) return;
      const data = await fetchPendingInvites(user.name);
      setInvites(data);
    } catch (err) {
      console.error('Failed to load invites:', err);
    }
  };

  const handleInviteResponse = async (token: string, action: 'accept' | 'reject') => {
    if (!user?.name) return;
    setIsResponding(token);
    try {
      const result = await respondToInvite(token, user.name, action);
      setInvites(invites.filter(i => i.token !== token));
      if (action === 'accept') {
        navigate(`/project/${result.project_id}`);
        setShowNotifications(false);
      }
    } catch (err) {
      console.error('Invite response failed:', err);
    } finally {
      setIsResponding(null);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 border-b border-white/5 bg-gradient-to-b from-[#131313] to-[#0e0e0e] shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined" data-icon="menu">menu</span>
        </button>

        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-[#B6A0FF] text-2xl" data-icon="terminal">terminal</span>
          <h1 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-[#B6A0FF] drop-shadow-[0_0_8px_rgba(182,160,255,0.4)] leading-none">
            AXIOM <span className="tracking-widest ml-0.5">AI</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 transition-colors relative ${showNotifications ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
            {invites.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
                {invites.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-surface-container-low border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
                  {invites.length > 0 && (
                    <span className="text-[10px] font-bold text-primary">{invites.length} Pending Invites</span>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {invites.length === 0 ? (
                    <div className="p-8 text-center">
                      <span className="material-symbols-outlined text-slate-700 text-3xl mb-2" data-icon="notifications_paused">notifications_paused</span>
                      <p className="text-xs text-slate-500">Zero pending requests. Your inbox is clean.</p>
                    </div>
                  ) : (
                    invites.map(invite => (
                      <div key={invite.token} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-black text-primary flex-shrink-0">
                            {invite.invited_by.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs text-white leading-relaxed">
                              <span className="font-bold">{invite.invited_by}</span> invited you to <span className="text-primary font-bold">{invite.projects?.name}</span>
                            </p>
                            <span className="text-[9px] text-slate-600 font-mono mt-0.5 block italic">Initializing workstation...</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInviteResponse(invite.token, 'reject')}
                            disabled={isResponding === invite.token}
                            className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors border border-white/5"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleInviteResponse(invite.token, 'accept')}
                            disabled={isResponding === invite.token}
                            className="flex-1 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                          >
                            {isResponding === invite.token ? 'Accepting...' : 'Accept'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => navigate('/settings')}
          className="p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden cursor-pointer" onClick={() => navigate('/me')}>
          {user['Photo URL'] ? (
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src={user['Photo URL']}
            />
          ) : (
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1e1e2e&color=b6a0ff&bold=true`}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
