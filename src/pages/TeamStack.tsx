
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSavedStacks, fetchHistory, assignTask, searchUsers, createInvite, createProject, fetchProject, type TaskAssignment } from '../services/api';
import TechIcon from '@/components/ui/tech-icon';
import { supabase } from '@/lib/supabase';

const TeamStack = () => {
  const [savedStacks, setSavedStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [taskInput, setTaskInput] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignment, setAssignment] = useState<TaskAssignment | null>(null);
  const [, setAssignError] = useState<string | null>(null);

  const [dynamicMembers, setDynamicMembers] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMode, setInviteMode] = useState<'search' | 'link'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ username: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [inviteSent, setInviteSent] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    const initPage = async () => {
      const localSession = localStorage.getItem("vibe_session");
      const user = localSession ? JSON.parse(localSession).user : null;
      if (!user) return;

      try {
        // 1. Fetch stacks
        const stacks = await fetchSavedStacks(user.name);
        setSavedStacks(stacks);

        // 2. Load Project & Members
        const projectId = await getOrCreateProjectId();
        const projectData = await fetchProject(projectId);
        
        if (projectData) {
          let members = (projectData.project_members || []).map((m: any) => ({
            name: m.user_id,
            role: m.role === 'leader' ? 'Lead Architect' : 'Strategic Engineering Architect',
            skills: m.role === 'leader' 
              ? ['Next.js', 'Vercel Deployment', 'Architecture', 'TypeScript', 'Project Strategy']
              : ['Supabase', 'SQL Database', 'Backend API', 'Tailwind CSS', 'UI Implementation'],
            color: m.role === 'leader' ? 'bg-primary' : 'bg-indigo-500'
          }));

          // Ensure owner is in the list
          if (!members.find((m: any) => m.name === user.name)) {
            members.unshift({
               name: user.name,
               role: 'Lead Architect',
               skills: ['Next.js', 'Vercel Deployment', 'Architecture', 'TypeScript', 'Project Strategy'],
               color: 'bg-primary'
            });
          }
          setDynamicMembers(members);
        } else {
          // Fallback if no project found
          setDynamicMembers([{ 
            name: user.name, 
            role: 'Lead Architect', 
            skills: ['Generalist', 'Product Architecture'], 
            color: 'bg-primary' 
          }]);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const handleViewStack = async (stackName: string) => {
    const localSession = localStorage.getItem("vibe_session");
    const user = localSession ? JSON.parse(localSession).user : null;
    if (!user) return;
    
    // Fallback UI to show it's loading could go here if needed, but the network request should be fast.
    try {
       const history = await fetchHistory(user.name);
       const target = history.find(item => item.name === stackName);
       if (target && target.result_json) {
          navigate('/recommendations', { state: { result: target.result_json } });
       } else {
          alert('Full infrastructure blueprint details not found in history.');
       }
    } catch {
       alert('Failed to retrieve blueprint.');
    }
  };

  const handleOptimize = () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    
    // Simulate AI computing "Optimized Bench"
    setTimeout(() => {
      const devOpsSpec = { 
        name: 'Jordan S.', 
        role: 'DevOps Specialist', 
        skills: ['Kubernetes', 'CI/CD', 'Terraform'], 
        color: 'bg-green-500' 
      };
      
      setDynamicMembers(prev => {
        if (prev.find(m => m.name === 'Jordan S.')) return prev;
        return [...prev, devOpsSpec];
      });
      setIsOptimizing(false);
    }, 1500);
  };

  const handleInvite = () => {
    setShowInviteModal(true);
    setInviteLink('');
    setSearchResults([]);
    setSearchQuery('');
    setInviteSent(null);
    setLinkCopied(false);
    setInviteMode('search');
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(q);
        setSearchResults(results);
      } finally {
        setIsSearching(false);
      }
    }, 100);
  };

  const getSessionUser = () => {
    const s = localStorage.getItem('vibe_session');
    return s ? JSON.parse(s).user : null;
  };

  const getOrCreateProjectId = async (): Promise<string> => {
    if (currentProjectId) return currentProjectId;
    const user = getSessionUser();
    if (!user) throw new Error('Not authenticated');

    // First, try to find an existing project for this user
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.name)
      .order('created_at', { ascending: true })
      .limit(1);

    if (data && data.length > 0 && data[0].id) {
      setCurrentProjectId(data[0].id);
      return data[0].id;
    }

    // No project found — auto-create a default "My Team" project
    try {
      const newProject = await createProject(
        'My Team',
        'Default team workspace for collaboration and invites.',
        user.name
      );
      setCurrentProjectId(newProject.id);
      return newProject.id;
    } catch {
      throw new Error('Failed to create a default team project. Please check your connection.');
    }
  };

  const handleSendInviteToUser = async (username: string) => {
    const user = getSessionUser();
    if (!user) return;
    try {
      const projectId = await getOrCreateProjectId();
      await createInvite(projectId, user.name || user.id, username);
      setInviteSent(username);
      setTimeout(() => setInviteSent(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send invite.');
    }
  };

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    const user = getSessionUser();
    if (!user) { setIsGeneratingLink(false); return; }
    try {
      const projectId = await getOrCreateProjectId();
      const invite = await createInvite(projectId, user.name || user.id);
      const link = `${window.location.origin}/invite/${invite.token}`;
      setInviteLink(link);
    } catch (err: any) {
      alert(err.message || 'Failed to generate link.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleAssignTask = async () => {
    if (!taskInput.trim() || isAssigning) return;
    setIsAssigning(true);
    setAssignment(null);
    setAssignError(null);

    // Build team profiles from current dynamic members (excluding AI)
    const teamProfiles = dynamicMembers
      .filter(m => m.name !== 'Aether AI')
      .map(m => ({ name: m.name, role: m.role, skills: m.skills }));

    try {
      const result = await assignTask(taskInput, teamProfiles);
      setAssignment(result);
    } catch (err: any) {
      setAssignError(err.message || 'Assignment failed. Check backend logs.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <>
    <main className="pt-24 pb-32 px-5 space-y-6 max-w-lg mx-auto lg:max-w-7xl lg:px-8">
      {/* Welcome / Page Header */}
      <section className="space-y-1">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80 font-label">Team Architecture</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline leading-none">Engineering Core</h2>
      </section>

      {/* Technical Synergy Section */}
      <section className="p-6 rounded-xl bg-surface-container-low luminous-edge relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 ai-pulse">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Rapid Prototyping</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-on-surface-variant">Technical Synergy</p>
            <p className="text-5xl font-headline font-bold text-primary tracking-tighter leading-none">94.2%</p>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-[94.2%] transition-all duration-1000"></div>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            System architecture is aligned with current sprint velocity. Node redundancy minimized.
          </p>
        </div>
      </section>

      {/* Project Vibe & Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vibe Score Card */}
        <div className="p-5 rounded-xl bg-surface-container-high flex flex-col justify-between items-start aspect-square relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl" data-icon="rocket_launch">rocket_launch</span>
          </div>
          <span className="material-symbols-outlined text-secondary" data-icon="mood">mood</span>
          <div className="mt-auto">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Vibe Score</p>
            <p className="text-4xl font-headline font-black text-on-surface tracking-tighter">88</p>
          </div>
        </div>
        
        {/* Active Nodes Card */}
        <div className="p-5 rounded-xl bg-surface-container-high flex flex-col justify-between items-start aspect-square">
          <span className="material-symbols-outlined text-tertiary" data-icon="hub">hub</span>
          <div className="mt-auto">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Active Nodes</p>
            <p className="text-4xl font-headline font-black text-on-surface tracking-tighter">{dynamicMembers.length}</p>
          </div>
        </div>

        {/* Saved Stacks (Desktop only or shared) */}
        <div className="hidden lg:flex p-5 rounded-xl bg-surface-container-high flex-col justify-between items-start aspect-square border-t border-primary/10">
          <span className="material-symbols-outlined text-primary" data-icon="inventory_2">inventory_2</span>
          <div className="mt-auto w-full">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Design Vault</p>
            <p className="text-4xl font-headline font-black text-on-surface tracking-tighter">{savedStacks.length}</p>
          </div>
        </div>
      </div>

      {/* Team Stack (Vertical) */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-lg font-bold font-headline">Team Stack</h3>
          <span className="text-[10px] text-on-surface-variant font-medium uppercase">{dynamicMembers.length} ARCHITECTS</span>
        </div>
        
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {/* Invite Architect Card */}
          <div 
            onClick={handleInvite}
            className="p-4 rounded-xl border-2 border-dashed border-outline-variant/30 flex items-center gap-4 group cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full border border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low text-on-surface-variant group-hover:text-primary group-hover:border-primary/50 transition-colors">
              <span className="material-symbols-outlined" data-icon="person_add">person_add</span>
            </div>
            <div>
              <p className="font-bold text-on-surface">Invite Architect</p>
              <p className="text-xs text-on-surface-variant">Expand your technical cluster</p>
            </div>
          </div>

          {/* Member Cards */}
          {dynamicMembers.map((member, index) => (
            <div key={index} className="p-4 rounded-xl bg-surface-container-lowest glass-card luminous-edge flex items-center gap-4 group">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full overflow-hidden border border-white/10 ${member.color}/20 flex items-center justify-center`}>
                  <img 
                    alt={member.name}
                    className="w-full h-full object-cover" 
                    src={`https://ui-avatars.com/api/?name=${member.name}&background=1e1e2e&color=b6a0ff&bold=true`}
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-lowest rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <p className="font-bold text-on-surface truncate max-w-[120px] sm:max-w-[200px]" title={member.name}>{member.name}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                    member.role.includes('Lead') ? "text-secondary bg-secondary/10" : "text-tertiary bg-tertiary/10"
                  )}>
                    {member.role.includes('Lead') ? "LEAD" : "DATA"}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">{member.skills.slice(0, 2).join(' & ')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Primary Actions */}
      <section className="flex flex-col lg:flex-row gap-3 pt-4">
        <button 
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="w-full lg:w-auto lg:px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          {isOptimizing ? (
            <div className="w-5 h-5 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-lg" data-icon="bolt">bolt</span>
          )}
          {isOptimizing ? 'Optimizing...' : 'Optimize Bench'}
        </button>
        <button 
          onClick={() => navigate('/workflow')}
          className="w-full lg:w-auto lg:px-8 py-4 rounded-full bg-surface-container-highest text-on-surface font-bold flex items-center justify-center gap-2 border border-outline-variant/20 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg" data-icon="account_tree">account_tree</span>
          View Workflow
        </button>
      </section>

      {/* AI Task Dispatcher (Retained logic, new style) */}
      <section className="pt-8 space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" data-icon="smart_toy">smart_toy</span>
          <h2 className="font-headline text-lg font-bold text-on-surface uppercase tracking-widest">Task Dispatcher</h2>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 space-y-4">
           <div className="flex gap-3">
              <input
                type="text"
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isAssigning && taskInput.trim() && handleAssignTask()}
                placeholder="Describe a task for the team..."
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleAssignTask}
                disabled={isAssigning || !taskInput.trim()}
                className="bg-primary/20 hover:bg-primary/30 text-primary p-3 rounded-xl transition-all disabled:opacity-50"
              >
                {isAssigning ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined" data-icon="send">send</span>
                )}
              </button>
           </div>
           
           {assignment && (
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2"
             >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-primary">Assigned to {assignment.assigned_to}</span>
                  <span className="text-[10px] font-black text-primary/60 uppercase">{assignment.confidence}% Confidence</span>
                </div>
                <p className="text-xs text-on-surface-variant italic leading-relaxed">{assignment.rationale}</p>
             </motion.div>
           )}
        </div>
      </section>

      {/* Architecture Vault: Saved Stacks */}
      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary" data-icon="inventory_2">inventory_2</span>
            <h2 className="font-headline text-2xl font-bold text-white uppercase tracking-widest text-sm">Design Vault</h2>
        </div>
        
        {loading ? (
            <div className="text-center py-20">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm">Opening vault...</p>
            </div>
        ) : savedStacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedStacks.map(stack => (
                    <div 
                      key={stack.id} 
                      onClick={() => handleViewStack(stack.name)}
                      className="bg-surface-container-low p-6 rounded-2xl border border-white/5 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col h-full cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">{stack.name}</h3>
                            <span className="text-[10px] text-slate-500 font-mono italic">{new Date(stack.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-400 text-xs mb-6 flex-grow line-clamp-2 italic">"{stack.description}"</p>
                        
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 mt-auto">
                            {stack.tech_slugs?.slice(0, 5).map((slug: string, i: number) => (
                                <TechIcon key={i} slug={slug} size={20} className="w-8 h-8" />
                            ))}
                            {stack.tech_slugs?.length > 5 && (
                                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[10px] text-slate-500 border border-white/5">
                                    +{stack.tech_slugs.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-white/10">
                <p className="text-slate-500 mb-2">The vault is empty.</p>
                <p className="text-[10px] uppercase tracking-widest text-primary/60">Generate and save a stack to store it here</p>
            </div>
        )}
      </div>
    </main>

    {/* ─── Invite Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowInviteModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-lg bg-[#0a0f1c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-headline font-black tracking-tighter text-white uppercase">Invite Architect</h2>
                    <p className="text-slate-500 text-xs mt-1">Add a collaborator to your team network.</p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-base" data-icon="close">close</span>
                  </button>
                </div>
                <div className="flex bg-white/5 rounded-xl p-1 gap-1 mb-6">
                  {(['search', 'link'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setInviteMode(mode)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        inviteMode === mode ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm" data-icon={mode === 'search' ? 'search' : 'link'}>{mode === 'search' ? 'search' : 'link'}</span>
                      {mode === 'search' ? 'Search Users' : 'Share Link'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-6">
                <AnimatePresence mode="wait">
                  {inviteMode === 'search' ? (
                    <motion.div key="search" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg" data-icon="search">search</span>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search by username..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {searchResults.length > 0 ? searchResults.map(u => (
                          <div key={u.username} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-black text-primary">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white text-sm font-bold">{u.username}</p>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest">Axiom Architect</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSendInviteToUser(u.username)}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                inviteSent === u.username
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white'
                              }`}
                            >
                              {inviteSent === u.username ? '✓ Sent' : 'Invite'}
                            </button>
                          </div>
                        )) : searchQuery && !isSearching ? (
                          <div className="text-center py-8">
                            <p className="text-slate-500 text-sm">No results for "{searchQuery}"</p>
                            <p className="text-xs text-slate-600 mt-1">Try the Share Link tab instead.</p>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-600">
                            <span className="material-symbols-outlined text-4xl block mb-2" data-icon="manage_search">manage_search</span>
                            <p className="text-xs uppercase tracking-widest">Type to search the network</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="link" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <p className="text-slate-400 text-sm leading-relaxed">Generate a unique invite link. Anyone with this link can join your team — ideal for sharing via Slack, Discord, or email.</p>
                      {!inviteLink ? (
                        <button
                          onClick={handleGenerateLink}
                          disabled={isGeneratingLink}
                          className="w-full py-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isGeneratingLink ? (
                            <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />Generating...</>
                          ) : (
                            <><span className="material-symbols-outlined text-sm" data-icon="link">link</span>Generate Invite Link</>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Your Invite Link</p>
                            <div className="flex items-center gap-2">
                              <p className="text-white text-xs font-mono truncate flex-1">{inviteLink}</p>
                              <button
                                onClick={handleCopyLink}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                  linkCopied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-white/10 text-white hover:bg-primary hover:text-white border border-white/10'
                                }`}
                              >
                                {linkCopied ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>
                          <div className="relative group/qr p-2 rounded-2xl bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center">
                            <div className="p-4 bg-white rounded-xl shadow-inner relative z-10 overflow-hidden">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}&color=000000&bgcolor=ffffff&margin=1`}
                                alt="Invite QR Code"
                                className="w-[180px] h-[180px] rounded-lg block"
                              />
                            </div>
                            <div className="py-4 text-center">
                              <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mb-1">Secure Join Token</p>
                              <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">Scanning initializes team sync</p>
                            </div>
                            {/* Decorative glow */}
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 group-hover/qr:bg-primary/10 transition-colors" />
                          </div>
                          <button onClick={handleGenerateLink} className="w-full py-2 text-slate-600 hover:text-white text-[10px] uppercase tracking-widest font-black transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-xs" data-icon="refresh">refresh</span>
                            Cycle Invite Token
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeamStack;
