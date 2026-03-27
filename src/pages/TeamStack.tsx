
import { useState, useEffect, useRef } from 'react';
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
  const [assignError, setAssignError] = useState<string | null>(null);

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
        
        if (projectData && projectData.project_members) {
          const members = projectData.project_members.map((m: any) => ({
            name: m.user_id, // For now user_id is the username in our system
            role: m.role === 'leader' ? 'Lead Architect' : 'Architect',
            skills: m.role === 'leader' 
              ? ['System Architecture', 'Strategy', 'Infrastructure']
              : ['Full-stack', 'API Design', 'PostgreSQL'],
            color: m.role === 'leader' ? 'bg-primary' : 'bg-indigo-500'
          }));
          setDynamicMembers(members);
        } else {
          // Fallback if no members found somehow (should at least have owner)
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
    }, 400);
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
    <section className="p-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white mb-4">Team Stack</h1>
        <p className="text-slate-400 font-body text-lg">Align your team's technical DNA with project goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dynamicMembers.map((member, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index} 
            className="bg-surface-container-low p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full ${member.color}/20 flex items-center justify-center border border-${member.color}/30 text-white`}>
                <span className="material-symbols-outlined" data-icon="person">person</span>
              </div>
              <div>
                <h3 className="text-white font-bold">{member.name}</h3>
                <p className="text-slate-500 text-xs uppercase tracking-widest">{member.role}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Core Competencies</h4>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 border border-white/10 group-hover:border-primary/10 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500">Vibe Alignment</span>
                <span className="text-xs text-primary font-bold">94%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '94%' }}></div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Invite Architect Card */}
        <button 
          onClick={handleInvite}
          className="bg-surface-container-low p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/5 hover:border-primary/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/40 transition-all">
            <span className="material-symbols-outlined text-2xl" data-icon="person_add">person_add</span>
          </div>
          <p className="text-slate-500 text-sm font-medium group-hover:text-white transition-colors">Invite Architect</p>
          <p className="text-[10px] text-slate-600 tracking-widest uppercase">Search · Link · QR</p>
        </button>
      </div>

      {/* Team Intelligence Overview */}
      <div className="mt-12 bg-surface-container-low p-10 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-headline font-bold text-white mb-4">Technical Synergy</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Based on your team profile and project history, you are currently optimized for 
              <span className="text-white font-medium"> Rapid Prototyping</span> and 
              <span className="text-white font-medium"> Distributed Systems</span>. 
              The synthesis engine recommends adding a DevOps specialist to balance the stack.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-bold tracking-tight hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Computing...
                  </>
                ) : 'Optimize Bench'}
              </button>
              <button 
                onClick={() => navigate('/workflow')}
                className="bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-lg text-sm font-bold tracking-tight hover:bg-white/10 transition-colors"
              >
                View Workflow
              </button>
            </div>
          </div>
          <div className="w-full md:w-64 aspect-square rounded-full border-8 border-primary/20 flex items-center justify-center relative">
             <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin-slow"></div>
             <div className="text-center">
               <span className="text-5xl font-headline font-black text-white">88</span>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Project Vibe</p>
             </div>
          </div>
        </div>
      </div>

      {/* AI Task Dispatcher */}
      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary" data-icon="smart_toy">smart_toy</span>
          <h2 className="font-headline text-2xl font-bold text-white uppercase tracking-widest text-sm">AI Task Dispatcher</h2>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Powered by Groq</span>
        </div>

        <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm mb-6 max-w-xl">
              Describe a task and the AI will analyze your team's skill profiles and automatically assign it to the most suitable member.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isAssigning && taskInput.trim() && handleAssignTask()}
                placeholder="e.g. Build the real-time WebSocket API for collaborative editing..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                onClick={handleAssignTask}
                disabled={isAssigning || !taskInput.trim()}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm tracking-tight hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isAssigning ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Analyzing...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm" data-icon="send">send</span> Assign</>  
                )}
              </button>
            </div>

            {assignError && (
              <p className="mt-3 text-red-400 text-xs">{assignError}</p>
            )}

            {assignment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Assignment Card */}
                <div className="md:col-span-2 bg-black/40 border border-primary/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full"></div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-lg font-black text-primary flex-shrink-0">
                      {assignment.assigned_to.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-bold text-lg">{assignment.assigned_to}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">Assigned</span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{assignment.rationale}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">AI Confidence</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-headline font-black text-primary">{assignment.confidence}%</span>
                    </div>
                    <div className="mt-2 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${assignment.confidence}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Est. Effort</p>
                    <p className="text-white font-bold text-sm">{assignment.estimated_effort}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

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
                          <div className="relative group/qr p-1 rounded-2xl bg-gradient-to-br from-primary/20 via-white/5 to-transparent border border-white/10 shadow-2xl flex flex-col items-center">
                            <div className="p-4 bg-white rounded-xl shadow-inner relative z-10">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}&color=000000&bgcolor=ffffff&margin=1`}
                                alt="Invite QR Code"
                                className="w-[180px] h-[180px] rounded-lg"
                                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                                style={{ opacity: 0, transition: 'opacity 0.5s ease-in' }}
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
    </section>
  );
};

export default TeamStack;
