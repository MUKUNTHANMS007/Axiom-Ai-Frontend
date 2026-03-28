import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserTasks, updateTaskStatus, type Task } from '../services/api';

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'review' | 'done'>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('vibe_session') || '{}').user;

  useEffect(() => {
    loadTasks();
  }, [user?.name]);

  const loadTasks = async () => {
    if (!user?.name) return;
    try {
      const data = await fetchUserTasks(user.name);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    if (!user?.name) return;
    setUpdatingTaskId(taskId);
    try {
      await updateTaskStatus(taskId, user.name, newStatus, updateMessage || `Status changed to ${newStatus}`);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      setUpdateMessage('');
      setUpdatingTaskId(null);
    } catch (err) {
      console.error('Failed to update task:', err);
      setUpdatingTaskId(null);
    }
  };

  const statusConfig = {
    todo: { label: 'To Do', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: 'list_alt' },
    in_progress: { label: 'In Progress', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: 'trending_up' },
    review: { label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'rate_review' },
    done: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'check_circle' },
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <section className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="mb-12">
        <span className="text-primary font-label font-semibold tracking-[0.2em] uppercase text-xs mb-3 block">
          Individual · Focus
        </span>
        <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white mb-4 shimmer-text">
          My Tasks
        </h1>
        <p className="text-slate-400 font-body text-lg max-w-xl">
          Complete your assigned engineering modules and update your team on progress.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'todo', 'in_progress', 'review', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
              filter === f
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
            }`}
          >
            {f === 'all' ? 'All Tasks' : statusConfig[f as keyof typeof statusConfig].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Fetching your assignments...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl border border-dashed border-white/10 p-20 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-600 mb-4" data-icon="task_alt">task_alt</span>
          <h3 className="text-xl font-bold text-white mb-2">No tasks found</h3>
          <p className="text-slate-500">You don't have any tasks in this status. Great job!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, index) => {
              return (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  className="glass-card rounded-3xl p-8 group hover:border-primary/50 hover:shadow-primary/5 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8 relative z-10">
                    {/* Status Toggle Box */}
                    <div className="flex-shrink-0">
                      <div className="flex flex-row md:flex-col gap-1 p-1 bg-black/40 rounded-xl border border-white/5 md:w-32">
                        {(['todo', 'in_progress', 'review', 'done'] as const).map(s => {
                          const isActive = task.status === s;
                          const sCfg = statusConfig[s];
                          return (
                            <button
                              key={s}
                              onClick={() => handleUpdateStatus(task.id, s)}
                              disabled={updatingTaskId === task.id || isActive}
                              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                                isActive 
                                  ? `${sCfg.bg} ${sCfg.color}` 
                                  : 'hover:bg-white/5 text-slate-600'
                              } ${updatingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span className="material-symbols-outlined text-[14px]" data-icon={sCfg.icon}>{sCfg.icon}</span>
                              <span className="md:inline hidden">{sCfg.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Task Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                          {task.projects?.name}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 ${
                          task.priority === 'high' || task.priority === 'critical' ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2 italic">
                        "{task.description}"
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono">
                        {task.estimated_effort && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
                            Estimated: {task.estimated_effort}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs" data-icon="person_edit">person_edit</span>
                          By: {task.assigned_by}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs" data-icon="calendar_month">calendar_month</span>
                          Set: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Task Actions */}
                    <div className="flex-shrink-0 lg:w-56 space-y-3">
                      {task.status !== 'done' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'done')}
                          disabled={updatingTaskId === task.id}
                          className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {updatingTaskId === task.id ? (
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>
                          )}
                          {updatingTaskId === task.id ? 'Syncing...' : 'Mark Completed'}
                        </button>
                      )}

                      {/* AI Context Card (if available) */}
                      {task.ai_confidence && (
                        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-3xl text-primary" data-icon="smart_toy">smart_toy</span>
                          </div>
                          <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-2">AI Dispatcher Context</p>
                          <div className="flex items-end gap-1 mb-2">
                            <span className="text-2xl font-black text-primary leading-none">{task.ai_confidence}%</span>
                            <span className="text-[9px] text-primary/60 font-medium mb-0.5">Confidence</span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 italic leading-tight">
                            {task.ai_rationale}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional Status Update Comment Box */}
                  <AnimatePresence>
                    {updatingTaskId === task.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
                      >
                        <textarea
                          autoFocus
                          value={updateMessage}
                          onChange={e => setUpdateMessage(e.target.value)}
                          placeholder="Add a status update/note for the team..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors resize-none mb-3"
                        />
                        <p className="text-[9px] text-slate-500">Press ENTER or click a status above to save your update.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};

export default MyTasks;
