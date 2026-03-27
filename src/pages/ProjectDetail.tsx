import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchProject, createInvite, searchUsers, assignTask, createTask, fetchProjectTasks, updateTaskStatus, removeMember,
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
  
  // AI Dispatcher State
  const [taskInput, setTaskInput] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignment, setAssignment] = useState<TaskAssignment | null>(null);

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
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setInviteQuery(q);
    if (q.length < 2) {
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
    try {
      const invite = await createInvite(projectId, user.name, username);
      setInviteToken(invite.token);
      setInviteQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Invite failed:', err);
    }
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
      setAssignment(result);
    } catch (err) {
      console.error('AI assignment failed:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmTask = async () => {
    if (!assignment || !projectId || !user?.name) return;
    try {
      await createTask({
        project_id: projectId,
        title: taskInput,
        description: assignment.rationale,
        assigned_to: assignment.assigned_to,
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

  const copyInviteLink = () => {
    if (!inviteToken) return;
    const url = `${window.location.origin}/invite/${inviteToken}`;
    navigator.clipboard.writeText(url);
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
            <div className="space-y-10">
              {/* Invite Panel (Owner Only) */}
              {isOwner && (
                <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
                  <h2 className="text-xl font-headline font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" data-icon="person_add">person_add</span>
                    Invite Collaborators
                  </h2>
                  
                  <div className="relative mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" data-icon="search">search</span>
                        <input
                          type="text"
                          value={inviteQuery}
                          onChange={e => handleSearchUsers(e.target.value)}
                          placeholder="Search users on platform..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => handleCreateInvite()}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl font-bold text-sm border border-white/10 transition-all"
                      >
                        Generate Link
                      </button>
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {isSearching || searchResults.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-surface-container-low border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                        >
                          {isSearching ? (
                            <div className="p-4 text-center text-xs text-slate-500">Searching platform database...</div>
                          ) : (
                            searchResults.map(u => (
                              <button
                                key={u.username}
                                onClick={() => handleCreateInvite(u.username)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 text-left transition-colors group border-b border-white/5 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-bold text-white uppercase tracking-wider">{u.username}</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-700 group-hover:text-primary transition-colors" data-icon="arrow_forward">arrow_forward</span>
                              </button>
                            ))
                          )}
                        </motion.div>
                      ) : inviteQuery.length >= 2 && searchResults.length === 0 && !isSearching ? (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-low border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-500 z-20 shadow-2xl">
                          No users found with that name. Maybe generate an invite link instead?
                        </div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {/* Generated Invite Token */}
                  <AnimatePresence>
                    {inviteToken && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex items-center justify-between gap-4"
                      >
                        <div className="flex-grow">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Invite link generated</p>
                          <p className="text-white text-xs font-mono truncate max-w-md">{window.location.origin}/invite/{inviteToken}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={copyInviteLink}
                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
                            title="Copy Link"
                          >
                            <span className="material-symbols-outlined text-lg" data-icon="content_copy">content_copy</span>
                          </button>
                          <button
                            onClick={() => setInviteToken(null)}
                            className="p-3 bg-white/5 text-slate-500 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg" data-icon="close">close</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              {/* Task Creation AI Dispatcher (Owner Only) */}
              {isOwner && (
                <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5">
                  <h2 className="text-xl font-headline font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" data-icon="smart_toy">smart_toy</span>
                    AI Task Dispatcher
                  </h2>
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
