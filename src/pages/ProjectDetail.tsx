import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchProject, createInvite, searchUsers, assignTask, createTask, fetchProjectTasks, updateTaskStatus, removeMember,
  updateProject, deleteProject,
  type Project, type Task, type TaskAssignment, type TeamMemberProfile 
} from '../services/api';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'tasks' | 'settings'>('team');
  const [inviteQuery, setInviteQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ username: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteMode, setInviteMode] = useState<'search' | 'link'>('search');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  // AI Dispatcher State
  const [taskInput, setTaskInput] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignment, setAssignment] = useState<TaskAssignment | null>(null);
  
  // Hybrid Assignment State
  const [dispatchMode, setDispatchMode] = useState<'ai' | 'manual'>('ai');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualAssignee, setManualAssignee] = useState('');
  const [manualPriority, setManualPriority] = useState('medium');
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  
  // Settings State
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('vibe_session') || '{}').user;

  useEffect(() => {
    if (projectId) loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      if (!projectId) return;
      const [projData, taskData] = await Promise.all([
        fetchProject(projectId),
        fetchProjectTasks(projectId)
      ]);
      setProject(projData);
      setTasks(taskData);
      setEditName(projData.name);
      setEditDescription(projData.description || '');
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setInviteQuery(q);
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(q);
      setSearchResults(results.filter(r => 
        r.username !== user?.name && 
        !project?.project_members?.some(m => m.user_id === r.username)
      ));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateInvite = async (username?: string) => {
    if (!projectId || !user?.name) return;
    setIsGeneratingLink(true);
    try {
      const invite = await createInvite(projectId, user.name, username);
      setInviteToken(invite.token);
      if (!username) {
        setInviteMode('link');
      }
      setInviteQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Invite failed:', err);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteToken) return;
    const url = `${window.location.origin}/invite/${inviteToken}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAIDispatch = async () => {
    if (!taskInput.trim() || !project || isAssigning) return;
    setIsAssigning(true);
    setAssignment(null);
    try {
      // Create team profiles for AI analysis (mocked skills for simplicity)
      const profiles: TeamMemberProfile[] = (project.project_members || []).map(m => ({
        name: m.user_id,
        role: m.role,
        skills: m.role === 'leader' ? ['Lead', 'Architect', 'Full Stack'] : ['Engineering', 'Technical Stack']
      }));

      const result = await assignTask(taskInput, profiles);
      if (result.status === 'error') {
        alert(`Validation Error: ${result.validation_error}`);
        return;
      }
      setAssignment(result);
    } catch (err) {
      console.error('AI assignment failed:', err);
      alert('Neural sync failed. Please check your network or task description.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmTask = async () => {
    if (!assignment || !projectId || !user?.name) return;

    // Helper to ensure the AI's returned name exactly matches a valid team member
    const sanitizeName = (returnedName: string, allowedProfiles: any[]) => {
      const cleanTarget = (returnedName || "").split('(')[0].split('/')[0].trim().toLowerCase();
      // Try to find an exact match first
      const match = allowedProfiles.find(p => p.name.trim().toLowerCase() === cleanTarget);
      // If we found a match among team members, use their exact name. Otherwise, fall back to current user.
      return match ? match.name : user.name;
    };

    try {
      await createTask({
        project_id: projectId,
        title: taskInput,
        description: assignment.rationale,
        assigned_to: sanitizeName(assignment.assigned_to, (project?.project_members || []).map(m => ({ name: m.user_id }))),
        assigned_by: user.name,
        priority: 'medium',
        estimated_effort: assignment.estimated_effort,
        ai_confidence: assignment.confidence,
        ai_rationale: assignment.rationale
      });
      setTaskInput('');
      setAssignment(null);
      loadProjectData(); // Refresh tasks list
    } catch (err) {
      console.error('Task creation failed:', err);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    if (!user?.name) return;
    try {
      await updateTaskStatus(taskId, user.name, newStatus, `Status updated via Project Workspace`);
      loadProjectData(); // Refresh tasks list
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!projectId || !isOwner || memberId === user?.name) return;
    if (!confirm(`Are you sure you want to remove ${memberId} from the project?`)) return;
    try {
      await removeMember(projectId, memberId);
      loadProjectData(); // Refresh member list
    } catch (err) {
      console.error('Removal failed:', err);
    }
  };

  const handleUpdateProject = async () => {
    if (!projectId || !isOwner) return;
    setIsUpdating(true);
    try {
      const updated = await updateProject(projectId, editName, editDescription);
      setProject(updated);
      alert('Project synchronized successfully.');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to sync project metadata.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !isOwner) return;
    if (!confirm("CRITICAL: Permanent deletion protocol requested. This will wipe all project data. Proceed?")) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      navigate('/my-projects');
    } catch (err) {
      console.error('Deletion failed:', err);
      alert('Failed to initiate deletion protocol.');
      setIsDeleting(false);
    }
  };

  const handleManualCreate = async () => {
    if (!projectId || !user?.name || !manualTitle.trim()) return;
    setIsCreatingManual(true);
    try {
      await createTask({
        project_id: projectId,
        title: manualTitle,
        description: manualDesc,
        assigned_to: manualAssignee || user.name, // Default to self if unassigned
        assigned_by: user.name,
        priority: manualPriority,
      });
      loadProjectData();
      setManualTitle('');
      setManualDesc('');
      setManualAssignee('');
      alert('Manual task initialized.');
    } catch (err) {
      console.error('Manual creation failed:', err);
      alert('Initialization error.');
    } finally {
      setIsCreatingManual(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 text-sm">Synchronizing project state...</p>
    </div>
  );

  if (!project) return (
    <div className="p-20 text-center text-slate-500">Project not found.</div>
  );

  const isOwner = project.owner_id === user?.name;

  return (
    <section className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={() => navigate('/my-projects')} className="text-slate-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </button>
          <span className="text-primary font-label font-semibold tracking-[0.2em] uppercase text-xs">
            Project Workspace · {project.name}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white">
            {project.name}
          </h1>
          <div className="flex items-center gap-2">
            {(['team', 'tasks', 'settings'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeTab === t
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {activeTab === 'team' && (
            <div className="space-y-10">              {/* Invite Panel (Owner Only) synchronized with TeamStack */}
              {isOwner && (
                <div className="bg-surface-container-low rounded-3xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -z-10"></div>
                  
                  <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-sm" data-icon="person_add">person_add</span>
                          Invite Collaborators
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">Onboard architects to this technical workspace.</p>
                      </div>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-black/40 rounded-xl p-1 gap-1 mb-8">
                      {(['search', 'link'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setInviteMode(mode)}
                          className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            inviteMode === mode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm" data-icon={mode === 'search' ? 'search' : 'link'}>{mode === 'search' ? 'search' : 'link'}</span>
                          {mode === 'search' ? 'Search Users' : 'Share Link'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-8 pb-8">
                    <AnimatePresence mode="wait">
                      {inviteMode === 'search' ? (
                        <motion.div key="search" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" data-icon="search">search</span>
                            <input
                              type="text"
                              value={inviteQuery}
                              onChange={e => handleSearchUsers(e.target.value)}
                              placeholder="Search by username handle..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                            {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {searchResults.length > 0 ? searchResults.map(u => (
                              <div key={u.username} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-bold uppercase tracking-wider">{u.username}</p>
                                    <p className="text-slate-600 text-[9px] uppercase tracking-widest font-black">Ready for Sync</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleCreateInvite(u.username)}
                                  className="px-6 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-primary/20"
                                >
                                  Invite
                                </button>
                              </div>
                            )) : inviteQuery.length >= 2 && !isSearching ? (
                              <div className="text-center py-6 text-slate-600 italic text-xs">No users found on the network.</div>
                            ) : (
                              <div className="text-center py-6 text-slate-700">
                                <span className="material-symbols-outlined text-4xl block mb-2" data-icon="manage_search">manage_search</span>
                                <p className="text-[10px] uppercase font-black tracking-[0.2em]">Scan for available architects</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="link" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                          {!inviteToken ? (
                            <div className="text-center py-10 space-y-6">
                              <p className="text-slate-500 text-sm italic max-w-sm mx-auto">Generate a global invite link to share via Slack, Discord, or email.</p>
                              <button
                                onClick={() => handleCreateInvite()}
                                disabled={isGeneratingLink}
                                className="w-full py-4 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 group"
                              >
                                {isGeneratingLink ? (
                                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                ) : (
                                  <span className="material-symbols-outlined text-base group-hover:rotate-12 transition-transform" data-icon="link">link</span>
                                )}
                                {isGeneratingLink ? 'Generating Neural Link...' : 'Generate New Invite Token'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="p-5 bg-black/40 border border-white/10 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Invite URL</p>
                                  {linkCopied && <span className="text-[9px] text-emerald-400 font-bold uppercase animate-pulse">✓ Copied</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-white text-xs font-mono truncate flex-1">{window.location.origin}/invite/{inviteToken}</p>
                                  <button
                                    onClick={handleCopyLink}
                                    className="p-2.5 bg-white/5 hover:bg-primary text-white rounded-xl transition-all border border-white/10 hover:border-primary"
                                  >
                                    <span className="material-symbols-outlined text-sm" data-icon="content_copy">content_copy</span>
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col items-center gap-6 py-6 px-8 rounded-3xl bg-white/5 border border-white/10 relative group/qr shadow-2xl overflow-hidden justify-center text-center">
                                <div className="relative z-10 p-4 bg-white rounded-2xl shadow-inner group-hover/qr:scale-[1.02] transition-transform duration-500">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/invite/${inviteToken}`)}&color=000000&bgcolor=ffffff&margin=1`}
                                    alt="Project Invite QR"
                                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg block"
                                  />
                                </div>
                                <div className="relative z-10 space-y-1">
                                  <p className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">Project Access Terminal</p>
                                  <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Scanning initializes team synchronization</p>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full -z-10 animate-pulse"></div>
                              </div>

                              <button 
                                onClick={() => handleCreateInvite()}
                                className="w-full py-2 text-slate-600 hover:text-white text-[10px] uppercase tracking-[0.3em] font-black transition-colors flex items-center justify-center gap-2 group"
                              >
                                <span className="material-symbols-outlined text-xs group-hover:rotate-180 transition-transform duration-700" data-icon="refresh">refresh</span>
                                Recycle Invite Bridge
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}


              {/* Team Roster */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.project_members?.map(m => (
                  <div key={m.user_id} className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all">
                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xl font-black text-white uppercase">
                      {m.user_id.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">{m.user_id}</h3>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${m.role === 'leader' ? 'text-primary' : 'text-slate-500'}`}>
                        {m.role}
                      </span>
                    </div>
                    {m.role === 'leader' ? (
                      <span className="ml-auto material-symbols-outlined text-primary text-lg" data-icon="verified">verified</span>
                    ) : isOwner && (
                      <button 
                        onClick={() => handleRemoveMember(m.user_id)}
                        className="ml-auto p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                        title="Remove Member"
                      >
                        <span className="material-symbols-outlined text-base" data-icon="person_remove">person_remove</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-8">
              {/* Task Creation Hybrid Control (Owner Only) */}
              {isOwner && (
                <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm" data-icon={dispatchMode === 'ai' ? 'smart_toy' : 'assignment_add'}>
                        {dispatchMode === 'ai' ? 'smart_toy' : 'assignment_add'}
                      </span>
                      {dispatchMode === 'ai' ? 'AI Task Dispatcher' : 'Manual Entry'}
                    </h2>

                    {/* Mode Toggle */}
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 w-fit">
                      <button 
                        onClick={() => setDispatchMode('ai')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${dispatchMode === 'ai' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-xs" data-icon="auto_awesome">auto_awesome</span>
                        AI Engine
                      </button>
                      <button 
                        onClick={() => setDispatchMode('manual')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${dispatchMode === 'manual' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-xs" data-icon="person">person</span>
                        Manual
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {dispatchMode === 'ai' ? (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={taskInput}
                            onChange={e => setTaskInput(e.target.value)}
                            placeholder="Describe a task for the team..."
                            className="flex-grow bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                          />
                          <button
                            onClick={handleAIDispatch}
                            disabled={isAssigning || !taskInput.trim()}
                            className="bg-primary text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50"
                          >
                            {isAssigning ? 'Analysing...' : 'Assign'}
                          </button>
                        </div>

                        <AnimatePresence>
                          {assignment && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-4"
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-sm font-black text-primary flex-shrink-0">
                                  {assignment.assigned_to.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-grow">
                                  <h4 className="text-white font-bold text-lg mb-1">Assigned to: {assignment.assigned_to}</h4>
                                  <p className="text-slate-400 text-sm italic">"{assignment.rationale}"</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Confidence</p>
                                  <p className="text-2xl font-black text-primary leading-none">{assignment.confidence}%</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                  Estimated Effort: {assignment.estimated_effort}
                                </span>
                                <div className="flex gap-2">
                                  <button onClick={() => setAssignment(null)} className="px-4 py-2 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/5 transition-colors">Discard</button>
                                  <button onClick={handleConfirmTask} className="px-6 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20">Confirm Assignment</button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
                            <input 
                              type="text"
                              value={manualTitle}
                              onChange={e => setManualTitle(e.target.value)}
                              placeholder="Optimize DB performance..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Description</label>
                            <textarea 
                              value={manualDesc}
                              onChange={e => setManualDesc(e.target.value)}
                              rows={3}
                              placeholder="Analyze query patterns and index missing fields..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign To Architect</label>
                            <select 
                              value={manualAssignee}
                              onChange={e => setManualAssignee(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                            >
                              <option value="">(Select Assignee)</option>
                              {project.project_members?.map(m => (
                                <option key={m.user_id} value={m.user_id}>{m.user_id}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Complexity</label>
                              <select 
                                value={manualPriority}
                                onChange={e => setManualPriority(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-[10px] font-bold uppercase text-white focus:outline-none focus:border-white/20 transition-colors"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button 
                                onClick={handleManualCreate}
                                disabled={isCreatingManual || !manualTitle.trim()}
                                className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                              >
                                {isCreatingManual ? 'Initializing...' : 'Sync Task'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Task Board */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Project Progress</h3>
                {tasks.length === 0 ? (
                  <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/5">
                    <p className="text-slate-600 text-sm italic">No tasks assigned yet. Use the dispatcher above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {tasks.map(t => (
                      <div key={t.id} className="bg-surface-container-low p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center gap-6 group hover:border-primary/20 transition-all">
                        <div className={`w-1.5 rounded-full self-stretch md:block hidden ${
                          t.status === 'done' ? 'bg-emerald-500' :
                          t.status === 'in_progress' ? 'bg-primary' : 'bg-slate-700'
                        }`}></div>
                        <div className="flex-grow">
                          <h4 className="text-white font-bold text-base mb-1 group-hover:text-primary transition-colors">{t.title}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded leading-none">{t.assigned_to}</span>
                            <span className="text-slate-800 text-xs">·</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              t.status === 'done' ? 'text-emerald-500' :
                              t.status === 'in_progress' ? 'text-primary' : 'text-slate-500'
                            }`}>{t.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Quick Status Toggle */}
                          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                            {(['todo', 'in_progress', 'done'] as const).map(s => (
                              <button
                                key={s}
                                onClick={() => handleStatusUpdate(t.id, s)}
                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                                  t.status === s 
                                    ? s === 'done' ? 'bg-emerald-500/10 text-emerald-500' : s === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-white/10 text-white'
                                    : 'text-slate-600 hover:text-slate-400'
                                }`}
                              >
                                {s.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                          <div className="ml-2 pr-2">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 ${
                               t.priority === 'high' ? 'text-red-500 shadow-sm shadow-red-500/10' : 'text-slate-500'
                             }`}>
                               {t.priority}
                             </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 space-y-8">
                <div>
                  <h2 className="text-xl font-headline font-bold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" data-icon="settings">settings</span>
                    Project Configuration
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">Update the technical identity and description of this workspace.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Identifier (Name)</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors font-bold tracking-tight"
                      placeholder="Enter project name..."
                      disabled={!isOwner}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Synthesis (Description)</label>
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed text-sm italic"
                      placeholder="Enter project description..."
                      disabled={!isOwner}
                    />
                  </div>
                </div>

                {isOwner && (
                  <div className="pt-4">
                    <button 
                      onClick={handleUpdateProject}
                      disabled={isUpdating}
                      className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-sm" data-icon="sync">sync</span>
                      )}
                      Sync Variations
                    </button>
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="bg-red-500/5 rounded-3xl border border-red-500/20 p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-headline font-bold text-red-400 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" data-icon="warning">warning</span>
                      Danger Zone
                    </h2>
                    <p className="text-red-400/50 text-[10px] uppercase font-bold tracking-widest mt-1">High Impact Administrative Actions</p>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-red-500/5 rounded-2xl border border-red-400/10">
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Permanent Deletion</h4>
                      <p className="text-red-400/40 text-[10px] italic">Wipe all tasks, members, and roadmap data. This cannot be undone.</p>
                    </div>
                    <button 
                      onClick={handleDeleteProject}
                      disabled={isDeleting}
                      className="px-8 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {isDeleting ? 'Terminating...' : 'Delete Project'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">About Project</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">"{project.description || 'Initialization documentation pending...'}"</p>
            
            <div className="space-y-4 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Created</span>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Owner</span>
                <span className="text-[10px] text-primary font-black uppercase tracking-widest">{project.owner_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Tasks Total</span>
                <span className="text-[10px] text-white font-black">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Team Size</span>
                <span className="text-[10px] text-white font-black">{project.project_members?.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {tasks.filter(t => t.status !== 'todo').slice(0, 5).map(t => (
                <div key={t.id} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${t.status === 'done' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-white font-bold leading-tight line-clamp-2">{t.assigned_to} moved "{t.title}" to {t.status.replace('_', ' ')}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 font-mono">{new Date(t.updated_at || t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status !== 'todo').length === 0 && (
                <p className="text-[10px] text-slate-600 italic">No activity logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectDetail;
