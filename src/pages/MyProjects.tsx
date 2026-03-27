import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <section className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-primary font-label font-semibold tracking-[0.2em] uppercase text-xs mb-3 block">
            Workspace · Ecosystem
          </span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white mb-4">
            My Projects
          </h1>
          <p className="text-slate-400 font-body text-lg max-w-xl">
            Manage your collaborative engineering projects and team stacks.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-tight transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined" data-icon="add">add</span>
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading your workspace...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl border border-dashed border-white/10 p-20 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-600" data-icon="workspaces">workspaces</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Create your first project to start collaborating with your team and assigning AI-powered tasks.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-primary hover:underline font-bold text-sm flex items-center gap-1 mx-auto"
          >
            Create a project now <span className="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-surface-container-low p-8 rounded-3xl border border-white/5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors" data-icon="folder">folder</span>
                </div>
                {project.owner_id === user?.name && (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-widest px-2 py-1 rounded-full">Owner</span>
                )}
              </div>

              <h3 className="text-2xl font-headline font-bold text-white mb-3 group-hover:text-primary transition-colors relative z-10">
                {project.name}
              </h3>
              <p className="text-slate-400 text-sm mb-8 line-clamp-2 flex-grow relative z-10">
                {project.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                <div className="flex -space-x-2">
                  {project.project_members?.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {m.user_id.charAt(0)}
                    </div>
                  ))}
                  {(project.project_members?.length || 0) > 3 && (
                    <div className="w-8 h-8 rounded-full bg-surface-container border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-slate-400">
                      +{(project.project_members?.length || 0) - 3}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 font-mono italic">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
    </section>
  );
};

export default MyProjects;
