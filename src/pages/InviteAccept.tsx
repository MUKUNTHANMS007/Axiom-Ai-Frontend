import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchInviteByToken, respondToInvite, type ProjectInvite } from '../services/api';

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const [invite, setInvite] = useState<ProjectInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('vibe_session') || '{}');
  const user = session?.user;

  useEffect(() => {
    if (token) loadInvite();
  }, [token]);

  const loadInvite = async () => {
    try {
      if (!token) return;
      const data = await fetchInviteByToken(token);
      setInvite(data);
    } catch (err) {
      setError('Invalid or expired invite token.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (action: 'accept' | 'reject') => {
    if (!token || !user?.name) {
      // Not logged in, redirect to login with invite token
      navigate(`/login?invite=${token}`);
      return;
    }
    
    setIsResponding(true);
    try {
      const result = await respondToInvite(token, user.name, action);
      if (action === 'accept') {
        navigate(`/project/${result.project_id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Invite response failed:', err);
    } finally {
      setIsResponding(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 text-sm">Validating workspace invite...</p>
    </div>
  );

  if (error || !invite) return (
    <div className="p-20 text-center space-y-6">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-4xl text-red-400" data-icon="error">error</span>
      </div>
      <h2 className="text-2xl font-headline font-bold text-white">Oops! This link belongs in the past.</h2>
      <p className="text-slate-500 max-w-sm mx-auto">{error || 'This invite token is no longer valid.'}</p>
      <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline font-bold text-sm">Back to Safety</button>
    </div>
  );

  return (
    <section className="p-8 lg:p-12 max-w-7xl mx-auto w-full min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container-low border border-white/5 p-12 rounded-[40px] w-full max-w-2xl text-center shadow-2xl shadow-primary/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
          <span className="material-symbols-outlined text-4xl text-primary" data-icon="workspaces">workspaces</span>
        </div>

        <span className="text-primary font-label font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Workspace Invitation</span>
        <h1 className="text-4xl lg:text-5xl font-headline font-extrabold tracking-tighter text-white mb-6">
          Initialize <span className="text-primary">{invite.projects?.name}</span>?
        </h1>
        
        <p className="text-slate-400 font-body text-lg mb-10 max-w-md mx-auto leading-relaxed">
          <span className="text-white font-bold">{invite.invited_by}</span> is assembling a team for this project. 
          Respond to their request to access the architecture vault and task dispatcher.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <button
              onClick={() => handleResponse('reject')}
              disabled={isResponding}
              className="px-10 py-5 rounded-2xl font-bold text-sm tracking-tight text-slate-500 hover:bg-white/5 transition-colors border border-white/10"
            >
              Decline
            </button>
          ) : (
            <button
              onClick={() => navigate(`/signup?invite=${token}`)}
              className="px-10 py-5 rounded-2xl font-bold text-sm tracking-tight text-slate-500 hover:bg-white/5 transition-colors border border-white/10"
            >
              Register to View
            </button>
          )}
          <button
            onClick={() => handleResponse('accept')}
            disabled={isResponding}
            className="px-12 py-5 bg-white text-black rounded-2xl font-black text-sm tracking-tight hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5 disabled:opacity-50"
          >
            {isResponding ? 'Synchronizing...' : user ? 'Accept Invitation' : 'Join Team Engine'}
          </button>
        </div>

        {!user && (
          <p className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            You will be redirected to initialization after creating an account.
          </p>
        )}
      </motion.div>
    </section>
  );
};

export default InviteAccept;
