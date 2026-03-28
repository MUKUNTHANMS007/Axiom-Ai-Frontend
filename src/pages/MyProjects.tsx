import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { createProject, fetchProjects, type Project } from '../services/api';

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('vibe_session') || '{}').user;

  useEffect(() => {
    loadProjects();
  }, [user?.name]);

  const loadProjects = async () => {
    if (!user?.name) return;
    try {
      const data = await fetchProjects(user.name);
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !user?.name) return;
    try {
      setCreateError(null);
      const project = await createProject(newProject.name, newProject.description, user.name);
      setProjects([project, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      navigate(`/project/${project.id}`);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setCreateError(err.message || 'Failed to create project. Please check if the name is unique.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <main className="pt-24 pb-32 px-6 min-h-screen max-w-lg mx-auto lg:max-w-7xl lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-1">Architecture</p>
            <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">My Projects</h2>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-bold px-4 py-3 rounded-xl shadow-[0_8px_20px_rgba(182,160,255,0.3)] active:scale-95 transition-transform flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="add" style={{ fontVariationSettings: "'wght' 700" }}>add</span>
            <span className="text-sm">New</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          <button className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold whitespace-nowrap">All Projects</button>
          <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium whitespace-nowrap border border-outline-variant/10">Recent</button>
          <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium whitespace-nowrap border border-outline-variant/10">Archived</button>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-on-surface-variant text-sm italic">Synchronizing neural nodes...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full p-20 text-center border-2 border-dashed border-outline-variant/20 rounded-3xl">
              <p className="text-on-surface-variant mb-4 font-light">Ecosystem initialized but empty.</p>
              <button onClick={() => setShowCreateModal(true)} className="text-primary font-bold hover:underline">Launch first project</button>
            </div>
          ) : (
            projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/project/${project.id}`)}
                className="glass-card glow-border rounded-xl p-6 border border-white/5 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <span className="material-symbols-outlined text-4xl" data-icon="hub">hub</span>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mb-1 w-fit",
                      project.owner_id === user?.name ? "bg-secondary-container text-secondary" : "bg-surface-container-highest text-on-surface-variant"
                    )}>
                      {project.owner_id === user?.name ? 'Owner' : 'Collaborator'}
                    </span>
                    <h3 className="text-xl font-headline font-bold text-on-surface">{project.name}</h3>
                  </div>
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                  </button>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-2">
                  {project.description || 'No specialized engineering parameters defined for this project instance.'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {project.project_members?.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container overflow-hidden">
                        <img 
                          alt="Avatar" 
                          src={`https://ui-avatars.com/api/?name=${m.user_id}&background=1e1e2e&color=b6a0ff&bold=true`}
                        />
                      </div>
                    ))}
                    {(project.project_members?.length || 0) > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary">
                        +{(project.project_members?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-label text-[10px] uppercase tracking-wider text-outline mb-0.5">Created</p>
                    <p className="text-xs font-semibold text-on-surface">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contextual FAB for New Project */}
        <div className="fixed right-6 bottom-28 lg:hidden z-50">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-14 h-14 rounded-2xl bg-primary shadow-[0_15px_30px_rgba(182,160,255,0.4)] flex items-center justify-center text-on-primary active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl" data-icon="add" style={{ fontVariationSettings: "'wght' 700" }}>add</span>
          </button>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-low border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl shadow-primary/20"
          >
            <h2 className="text-3xl font-headline font-bold text-white mb-2">New Project</h2>
            <p className="text-slate-400 text-sm mb-8">Initialize a new workspace for your technical stack and team collaboration.</p>
            
            {createError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-lg mt-0.5" data-icon="error">error</span>
                <div>
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">Initialization Error</p>
                  <p className="text-red-400/80 text-xs italic leading-tight">{createError}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Project Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="e.g. Project Vibe-Code"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  placeholder="What are you building?"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-sm text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProject.name}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white px-6 py-4 rounded-xl font-bold text-sm tracking-tight transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Launch Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default MyProjects;
