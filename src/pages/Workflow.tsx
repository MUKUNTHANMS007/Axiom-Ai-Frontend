import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHistory, fetchSavedStacks, fetchProjects, fetchWorkflowTaskUpdates, type HistoryItem } from '../services/api';
import TechIcon from '@/components/ui/tech-icon';

interface WorkflowItem {
  id: string;
  type: 'synthesis' | 'vault_save' | 'deployment' | 'task_update';
  title: string;
  user: string;
  avatar: string;
  timestamp: string;
  stack: string[];
  score?: number;
  result_json?: any;
  message?: string;
  old_status?: string;
  new_status?: string;
}

const Workflow = () => {
  const [feed, setFeed] = useState<WorkflowItem[]>([]);
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'synthesis' | 'vault_save' | 'deployment' | 'task_update'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const localSession = localStorage.getItem('vibe_session');
      const user = localSession ? JSON.parse(localSession).user : null;
      if (!user) return;

      try {
        const [history, stacks] = await Promise.all([
          fetchHistory(user.name),
          fetchSavedStacks(user.name),
        ]);

        setVaultItems(stacks);

        // Build unified feed from history
        const historyItems: WorkflowItem[] = (history || []).map((item: HistoryItem) => ({
          id: item.id,
          type: 'synthesis',
          title: item.name,
          user: user.name,
          avatar: user.name.charAt(0).toUpperCase(),
          timestamp: item.created_at,
          stack: item.stack || [],
          score: item.score,
          result_json: item.result_json,
        }));

        // Build vault saves from stacks table
        const vaultFeedItems: WorkflowItem[] = (stacks || []).map((s: any) => ({
          id: `vault-${s.id}`,
          type: 'vault_save',
          title: s.name,
          user: user.name,
          avatar: user.name.charAt(0).toUpperCase(),
          timestamp: s.created_at,
          stack: s.tech_slugs || [],
        }));

        // Fetch user projects to get task updates
        const projects = await fetchProjects(user.name);
        const projectIds = projects.map(p => p.id);
        const taskUpdates = projectIds.length > 0 ? await fetchWorkflowTaskUpdates(projectIds) : [];

        const taskFeedItems: WorkflowItem[] = (taskUpdates || []).map((u: any) => ({
          id: `task-${u.id}`,
          type: 'task_update',
          title: u.task_title,
          user: u.user_id,
          avatar: u.user_id.charAt(0).toUpperCase(),
          timestamp: u.created_at,
          stack: [],
          message: u.message,
          old_status: u.old_status,
          new_status: u.new_status
        }));

        // Merge and sort by timestamp descending
        const merged = [...historyItems, ...vaultFeedItems, ...taskFeedItems].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setFeed(merged);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const typeConfig = {
    synthesis: {
      icon: 'auto_awesome',
      label: 'AI Synthesis',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      dot: 'bg-primary',
    },
    vault_save: {
      icon: 'inventory_2',
      label: 'Saved to Vault',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      dot: 'bg-purple-400',
    },
    deployment: {
      icon: 'rocket_launch',
      label: 'Deployed',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    task_update: {
      icon: 'edit_note',
      label: 'Task Evolution',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      dot: 'bg-amber-400',
    },
    member_joined: {
      icon: 'person_add',
      label: 'New Collaborator',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      dot: 'bg-blue-400',
    }
  };

  const filtered = activeFilter === 'all' ? feed : feed.filter(f => f.type === activeFilter);

  // Kanban buckets derived from data
  const kanban = {
    synthesis: feed.filter(f => f.type === 'synthesis').slice(0, 3),
    vault: vaultItems.slice(0, 3),
    deployed: feed.filter(f => f.type === 'deployment').slice(0, 3),
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <section className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-12">
        <span className="text-primary font-label font-semibold tracking-[0.2em] uppercase text-xs mb-3 block">
          Project OS · Live Feed
        </span>
        <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white mb-4">
          Workflow
        </h1>
        <p className="text-slate-400 font-body text-lg max-w-xl">
          A real-time pulse of every synthesis, blueprint save, and deployment your team has shipped.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'synthesis', 'vault_save', 'task_update', 'deployment'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                  activeFilter === f
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                {f === 'all' ? 'All Events' : f === 'vault_save' ? 'Vault Saves' : f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm">Loading workflow events...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-4" data-icon="timeline">timeline</span>
              <p className="text-slate-500">No events yet. Start synthesizing to populate your workflow.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5"></div>

              <div className="space-y-1">
                <AnimatePresence>
                  {filtered.map((item, index) => {
                    const config = typeConfig[item.type];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="flex gap-5 relative pl-2 pb-4 group"
                      >
                        {/* Timeline dot */}
                        <div className={`w-6 h-6 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 mt-4 relative z-10`}>
                          <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                        </div>

                        {/* Card */}
                        <div
                          onClick={() => item.result_json && navigate('/recommendations', { state: { result: item.result_json } })}
                          className={`flex-1 bg-surface-container-low p-5 rounded-2xl border border-white/5 transition-all ${
                            item.result_json ? 'cursor-pointer hover:border-primary/30 hover:-translate-y-0.5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                {item.avatar}
                              </div>
                              <div>
                                <h3 className="text-white font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                                    <span className="material-symbols-outlined text-[10px] align-middle mr-1" data-icon={config.icon}>{config.icon}</span>
                                    {config.label}
                                  </span>
                                  <span className="text-slate-600 text-[10px]">·</span>
                                  <span className="text-slate-600 text-[10px]">{item.user}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {item.score !== undefined && (
                                <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  {item.score}%
                                </span>
                              )}
                              <span className="text-[10px] text-slate-600 font-mono whitespace-nowrap">
                                {formatTime(item.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Task Update Specifics */}
                          {item.type === 'task_update' && (
                            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden group/task">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full"></div>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                  {item.old_status?.replace('_', ' ')}
                                </span>
                                <span className="material-symbols-outlined text-[10px] text-slate-700" data-icon="trending_flat">trending_flat</span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[9px] font-black text-amber-400 uppercase tracking-tighter">
                                  {item.new_status?.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                                {item.message}
                              </p>
                            </div>
                          )}

                          {/* Tech Stack */}
                          {item.stack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                              {item.stack.slice(0, 7).map((slug: string, i: number) => (
                                <TechIcon key={i} slug={slug.toLowerCase()} size={16} className="w-6 h-6" />
                              ))}
                              {item.stack.length > 7 && (
                                <span className="text-[9px] text-slate-600 self-center">+{item.stack.length - 7}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Board */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Board */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-white/5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm" data-icon="view_kanban">view_kanban</span>
              Status Board
            </h2>

            {/* In Synthesis */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In Synthesis</span>
                <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {kanban.synthesis.length}
                </span>
              </div>
              <div className="space-y-2">
                {kanban.synthesis.length > 0 ? kanban.synthesis.map((item, i) => (
                  <div key={i} className="bg-black/30 p-3 rounded-xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => item.result_json && navigate('/recommendations', { state: { result: item.result_json } })}
                  >
                    <p className="text-xs text-white font-medium line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{formatTime(item.timestamp)}</p>
                  </div>
                )) : (
                  <p className="text-[10px] text-slate-700 italic px-1">No active synthesis</p>
                )}
              </div>
            </div>

            {/* In Vault */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In Vault</span>
                <span className="ml-auto text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                  {vaultItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {kanban.vault.length > 0 ? kanban.vault.map((item: any, i: number) => (
                  <div key={i} className="bg-black/30 p-3 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
                    <p className="text-xs text-white font-medium line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{formatTime(item.created_at)}</p>
                  </div>
                )) : (
                  <p className="text-[10px] text-slate-700 italic px-1">Vault is empty</p>
                )}
                {vaultItems.length > 3 && (
                  <p className="text-[10px] text-slate-600 px-1">+{vaultItems.length - 3} more in vault</p>
                )}
              </div>
            </div>

            {/* Deployed */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployed</span>
                <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  {kanban.deployed.length}
                </span>
              </div>
              {kanban.deployed.length > 0 ? kanban.deployed.map((item, i) => (
                <div key={i} className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <p className="text-xs text-white font-medium line-clamp-1">{item.title}</p>
                </div>
              )) : (
                <div className="bg-black/20 p-4 rounded-xl border border-dashed border-white/5 text-center">
                  <p className="text-[10px] text-slate-700 italic">Hit "Deploy Stack" to populate</p>
                </div>
              )}
            </div>
          </div>

          {/* Latest Team Pulse */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-white/5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm" data-icon="group_work">group_work</span>
              Team Pulse
            </h2>
            {feed.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{item.title}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${typeConfig[item.type].color}`}>
                    {typeConfig[item.type].label}
                  </p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">{formatTime(item.timestamp)}</span>
              </div>
            ))}
            {feed.length === 0 && !loading && (
              <p className="text-[10px] text-slate-700 italic text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
