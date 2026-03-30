import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, respondToInvite, markNotificationRead, type Notification } from '../services/api';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('vibe_session') || '{}').user;

  useEffect(() => {
    if (user?.name) {
      loadNotifications();
      // Poll for notifications every 30s
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.name]);

  const loadNotifications = async () => {
    try {
      if (!user?.name) return;
      const data = await fetchNotifications(user.name);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleInviteResponse = async (notificationId: string, token: string, action: 'accept' | 'reject') => {
    if (!user?.name) return;
    setIsResponding(token);
    try {
      await respondToInvite(token, user.name, action);
      await markNotificationRead(notificationId);
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      if (action === 'accept') {
        const invite = notifications.find(n => n.id === notificationId);
        const projectId = invite?.data?.project_id;
        if (projectId) {
           navigate(`/project/${projectId}`);
        }
      }
    } catch (err) {
      console.error('Invite response failed:', err);
    } finally {
      setIsResponding(null);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }

    // Navigate to project
    const projectId = notification.data?.project_id;
    if (projectId) {
      navigate(`/project/${projectId}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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

        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-[#050505] flex items-center justify-center border border-white/10 overflow-hidden shadow-lg group-hover:border-primary/50 transition-all duration-300">
            <img src="/axiom-logo.png" alt="Axiom AI Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-white drop-shadow-[0_0_8px_rgba(182,160,255,0.2)] leading-none">
            AXIOM <span className="text-[#B6A0FF] tracking-widest ml-0.5">AI</span>
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
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-80 bg-surface-container-low border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-primary">{unreadCount} New Alerts</span>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <span className="material-symbols-outlined text-slate-700 text-3xl mb-2" data-icon="notifications_paused">notifications_paused</span>
                      <p className="text-xs text-slate-500">Zero pending alerts. Your inbox is clean.</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        onClick={() => notification.type !== 'invite' && handleNotificationClick(notification)}
                        className={`p-4 border-b border-white/5 transition-colors cursor-pointer ${notification.is_read ? 'opacity-60' : 'bg-primary/5 hover:bg-white/5'}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                            notification.type === 'invite' ? 'bg-primary/20 border-primary/40 text-primary' : 
                            notification.type === 'invite_accepted' ? 'bg-green-500/20 border-green-500/40 text-green-500' :
                            notification.type === 'task' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                            notification.type === 'task_completed' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-500' :
                            'bg-white/5 border-white/10 text-slate-400'
                          }`}>
                            <span className="material-symbols-outlined text-sm font-black" data-icon={
                              notification.type === 'invite' ? 'mail' : 
                              notification.type === 'invite_accepted' ? 'handshake' : 
                              notification.type === 'task' ? 'checklist' :
                              notification.type === 'task_completed' ? 'rule' :
                              'info'
                            }>
                              {notification.type === 'invite' ? 'mail' : 
                               notification.type === 'invite_accepted' ? 'handshake' : 
                               notification.type === 'task' ? 'checklist' :
                               notification.type === 'task_completed' ? 'rule' :
                               'info'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white leading-relaxed break-words">
                              {notification.message}
                            </p>
                            <span className="text-[9px] text-slate-600 font-mono mt-0.5 block italic">
                              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {notification.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {notification.type === 'invite' && !notification.is_read && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleInviteResponse(notification.id, notification.data?.token, 'reject')}
                              disabled={isResponding === notification.data?.token}
                              className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors border border-white/10"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleInviteResponse(notification.id, notification.data?.token, 'accept')}
                              disabled={isResponding === notification.data?.token}
                              className="flex-1 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                            >
                              {isResponding === notification.data?.token ? 'Accepting...' : 'Accept'}
                            </button>
                          </div>
                        )}
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

        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden">
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
