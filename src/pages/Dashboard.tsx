import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAnalytics, fetchProjects, fetchUserTasks, type AnalyticsData, type Project, type Task } from '../services/api';
import { getUserId } from '@/lib/auth';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const user = JSON.parse(localStorage.getItem('vibe_session') || '{}').user;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user_id = await getUserId();
        if (!user_id) return;

        const [analytics, projs, tsks] = await Promise.all([
          fetchAnalytics(user_id),
          fetchProjects(user_id),
          fetchUserTasks(user_id)
        ]);
        setData(analytics);
        setProjects(projs);
        setTasks(tsks);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    loadDashboardData();
  }, []);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: 'hub', color: 'text-primary' },
    { label: 'Pending Tasks', value: tasks.filter(t => t.status !== 'Completed').length, icon: 'task_alt', color: 'text-secondary' },
    { label: 'AI Precision', value: `${data?.average_score || 0}%`, icon: 'auto_awesome', color: 'text-tertiary' },
    { label: 'System Uptime', value: '99.9%', icon: 'bolt', color: 'text-accent' }
  ];

  return (
    <div className="flex-grow min-h-screen relative flex flex-col p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-12">
      
      {/* Welcome Header */}
      <section className="relative z-10 space-y-4">
        <div>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2 block">Command Center</span>
           <h1 className="text-4xl lg:text-5xl font-headline font-black tracking-tighter text-white">
             Good Evening, <span className="text-primary">{user?.name || 'Architect'}</span>.
           </h1>
        </div>
        <p className="text-on-surface-variant max-w-xl font-light text-lg italic">
          Your infrastructure cluster is operational. Ready for the next synthesis?
        </p>
      </section>

      {/* Stats Grid */}
      <section className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.label === 'Total Projects' ? 0.1 : 0.2 }} // Simplified delay logic
            className="bg-surface-container-low p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 flex items-center justify-center">
               <span className={cn("material-symbols-outlined text-5xl", stat.color)} data-icon={stat.icon}>{stat.icon}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
            <h3 className="text-4xl font-headline font-black text-white tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      {/* Core Activity Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Work */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" data-icon="workspaces">workspaces</span>
                Active Clusters
              </h2>
              <button 
                onClick={() => navigate('/my-projects')}
                className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
              >
                View All
              </button>
           </div>
           
           {projects.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {projects.slice(0, 4).map((p) => (
                 <div 
                   key={p.id}
                   onClick={() => navigate(`/project/${p.id}`)}
                   className="bg-surface-container-high p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group cursor-pointer"
                 >
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded">Project v1.0</span>
                    </div>
                    <h3 className="text-lg font-headline font-bold text-white mb-2">{p.name}</h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 italic mb-6">"{p.description}"</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                       <span>{new Date(p.created_at).toLocaleDateString()}</span>
                       <span className="group-hover:text-primary transition-colors flex items-center gap-1">Open <span className="material-symbols-outlined text-xs" data-icon="east">east</span></span>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="bg-surface-container-low p-12 rounded-3xl border border-dashed border-white/5 text-center space-y-4">
                <span className="material-symbols-outlined text-4xl text-slate-700" data-icon="inventory_2">inventory_2</span>
                <p className="text-slate-500 text-sm italic">No active projects found. Start by synthesizing a new architecture.</p>
             </div>
           )}
        </div>

        {/* Action Center */}
        <div className="lg:col-span-4 space-y-6">
           <h2 className="text-xl font-headline font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
             <span className="material-symbols-outlined text-primary" data-icon="bolt">bolt</span>
             Quick Launch
           </h2>
           
           <div className="space-y-4">
              <button 
                onClick={() => navigate('/architecture')}
                className="w-full bg-primary p-6 rounded-3xl group relative overflow-hidden flex flex-col items-center justify-center gap-2 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-black"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-20 rotate-12 group-hover:rotate-45 transition-transform">
                    <span className="material-symbols-outlined text-6xl" data-icon="auto_awesome">auto_awesome</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">New Synthesis</span>
                 <span className="text-xl font-headline font-black uppercase leading-none">AI Architect</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => navigate('/team-stack')}
                   className="p-4 bg-surface-container-high rounded-2xl border border-white/5 hover:border-secondary transition-all text-center flex flex-col items-center gap-2"
                 >
                    <span className="material-symbols-outlined text-secondary" data-icon="groups">groups</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Team</span>
                 </button>
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="p-4 bg-surface-container-high rounded-2xl border border-white/5 hover:border-accent transition-all text-center flex flex-col items-center gap-2"
                  >
                     <span className="material-symbols-outlined text-accent" data-icon="task">task</span>
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest">System Tasks</span>
                   </button>
               </div>

               {/* Neural Task Queue (Replaced Telemetry) */}
               <div className="bg-surface-container-low p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm" data-icon="task_alt">task_alt</span>
                       Neural Task Queue
                    </h4>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Batch</span>
                  </div>
                  
                  <div className="space-y-3">
                     {tasks.filter(t => t.status !== 'Completed').slice(0, 3).map((task) => (
                        <div key={task.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                           <div className="space-y-1 overflow-hidden">
                              <p className="text-[10px] text-white font-bold uppercase truncate">{task.title}</p>
                              <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter truncate">{task.priority} Priority • {task.projects?.name || "Global"}</p>
                           </div>
                           <button className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:border-primary/50 transition-all">
                              <span className="material-symbols-outlined text-[10px] text-primary" data-icon="check">check</span>
                           </button>
                        </div>
                     ))}
                     {tasks.filter(t => t.status !== 'Completed').length === 0 && (
                        <p className="text-[10px] text-slate-600 italic py-4 text-center">All operational systems clear.</p>
                     )}
                  </div>
                  <button 
                    onClick={() => navigate('/my-tasks')}
                    className="w-full py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                  >
                    Manage Neural Tasks
                  </button>
               </div>

               {/* Project Pulse */}
               <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4 shadow-2xl shadow-primary/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[40px] -mr-12 -mt-12" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary relative z-10">Active Project Pulse</h4>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-white uppercase mb-2">
                        <span>{projects[0]?.name || "Central Core"}</span>
                        <span>{Math.floor(Math.random() * 40 + 60)}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      AI Synthesis optimizing resource deployment for the next development cycle.
                    </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
