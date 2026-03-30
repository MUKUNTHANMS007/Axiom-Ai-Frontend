import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { analyzeProject, fetchHistory, createProject, createTask, assignTask, type HistoryItem } from '../services/api';
import { getUserId } from '@/lib/auth';
import { PromptInputBox } from '@/components/ai-prompt-box';
import { BeamsBackground } from '@/components/ui/beams-background';
import { motion } from 'framer-motion';
import TechIcon from '@/components/ui/tech-icon';

const Architecture = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [description] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explorations, setExplorations] = useState<HistoryItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<HistoryItem | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const [addingToProjects, setAddingToProjects] = useState(false);
  const [addStatus, setAddStatus] = useState<string | null>(null);

  // Get user ID from session
  const getUser = () => {
    const localSession = localStorage.getItem("vibe_session");
    if (localSession) {
      return JSON.parse(localSession).user;
    }
    return null;
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const user_id = await getUserId();
      if (!user_id) return;
      const data = await fetchHistory(user_id);
      setExplorations(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAnalyze = async (isDemo: boolean = false, inputDesc?: string) => {
    const finalDesc = inputDesc || description;
    if (!finalDesc.trim() && !isDemo) return;
    
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isDemo) {
        result = {
          project_title: "Aether Flux",
          project_summary: "A high-performance real-time collaborative platform using edge computing and serverless architecture for global scale.",
          complexity: "High",
          estimated_timeline: "8-12 weeks",
          confidence_score: 94,
          languages: [
            { name: "TypeScript", icon: "typescript", reason: "Type safety and ecosystem", match: 98, use_case: "Frontend & Backend" },
            { name: "Rust", icon: "rust", reason: "Performance and memory safety", match: 85, use_case: "Edge Computing" }
          ],
          frameworks: [
            { name: "Next.js", icon: "nextjs", category: "Frontend", reason: "SSR and routing", match: 95, docs_url: "#", learning_curve: "Moderate" },
            { name: "FastAPI", icon: "fastapi", category: "Backend", reason: "High performance API", match: 92, docs_url: "#", learning_curve: "Easy" }
          ],
          deploy_platforms: [
            { name: "Vercel", icon: "vercel", type: "PaaS", purpose: "Frontend hosting", pricing: "Freemium", monthly_estimate: "$0-20", budget_fit: "Excellent", scalability: "High", free_tier: true, best_for: "Quick deployment and high speed" }
          ],
          budget_breakdown: { minimum: "$0", recommended: "$45/mo", at_scale: "$200/mo", note: "Starting with free tiers for MVP" },
          architecture_patterns: [
            { name: "Serverless Microservices", recommended: true, pros: ["Infinite scalability", "Pay per use"], cons: ["Cold starts", "Complex debugging"] }
          ],
          mvp_roadmap: ["Step 1: Auth and simple real-time sync", "Step 2: Core editor logic", "Step 3: Scaling"]
        };
      } else {
        const user = getUser();
        result = await analyzeProject({ description: finalDesc }, user?.name || user?.id, 'groq/llama-3.3-70b-versatile', projectId || undefined);
      }

      navigate('/recommendations', { state: { result } });
    } catch (err: any) {
      setError(err.message || 'Something went wrong during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project: HistoryItem) => {
    setIsProcessingSelection(true);
    setSelectedProject(project);
    
    // Simulate AI model running in background
    setTimeout(() => {
      setIsProcessingSelection(false);
    }, 1500);
  };

  const handleAddToProjects = async () => {
    if (!selectedProject || !selectedProject.result_json) return;
    
    setAddingToProjects(true);
    setAddStatus("Initializing architecture deployment...");
    setError(null);
    
    try {
      const user_id = await getUserId();
      if (!user_id) {
        navigate('/login');
        return;
      }

      const localSession = localStorage.getItem("vibe_session");
      const user_name = localSession ? JSON.parse(localSession).user?.name : user_id;

      // 1. Create the project
      const project = await createProject(
        selectedProject.result_json.project_title,
        selectedProject.result_json.project_summary,
        user_name // Owner name
      );

      setAddStatus(`Project "${project.name}" created. Syncing AI roadmap...`);

      // 2. Fetch team members (simplified)
      const teamProfiles = [
        { name: user_name, role: 'Lead Architect', skills: ['Architecture', 'Strategy'] },
        { name: 'AI System', role: 'Technical Advisor', skills: ['Optimisation', 'Security'] }
      ];

      // 3. Process roadmap tasks
      const roadmap = selectedProject.result_json.mvp_roadmap || [];
      for (let i = 0; i < roadmap.length; i++) {
        const taskText = roadmap[i];
        const stepTitle = taskText.split(':')[0] || `Phase ${i+1}`;
        setAddStatus(`Neural Dispatch: ${stepTitle}...`);
        
        try {
          // AI Assignment
          const result = await assignTask(taskText, teamProfiles);
          
          // Create Persistent Task
          await createTask({
            project_id: project.id,
            title: stepTitle,
            description: taskText.includes(':') ? taskText.split(':').slice(1).join(':').trim() : taskText,
            assigned_to: result.assigned_to === user_name ? user_id : result.assigned_to, // Map back to ID if it chooses current user
            assigned_by: user_id,
            priority: i === 0 ? 'high' : 'medium',
            ai_confidence: result.confidence,
            ai_rationale: result.rationale,
            estimated_effort: result.estimated_effort
          });
        } catch (taskErr) {
          console.error("Task initialization failed for step:", stepTitle, taskErr);
        }
      }

      setAddStatus("Deployment success. Project workspace is now active.");
      setTimeout(() => {
        navigate('/my-projects');
      }, 2000);
    } catch (err: any) {
      console.error("Architecture deployment failed:", err);
      setError(`Critical Dispatch Failure: ${err.message || "Communication link broken during project creation"}`);
      setAddingToProjects(false);
      setAddStatus(null);
    }
  };

  return (
    <div className="flex-grow min-h-screen relative flex flex-col">
      <BeamsBackground className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen" />
      
      <main className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-12">
        {/* Header Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl" data-icon="architecture">architecture</span>
            <h1 className="text-4xl lg:text-5xl font-headline font-black tracking-tighter text-white uppercase">Architectural <span className="text-primary">Synthesis</span></h1>
          </div>
          <p className="text-on-surface-variant max-w-2xl font-light text-lg">
            Browse your archive or synthesize a new vision. Our engine maps optimal stacks and generates actionable roadmaps.
          </p>
        </section>

        {!selectedProject ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* New Synthesis Input */}
            <div className="lg:col-span-12">
               <div className="glass-panel w-full rounded-3xl p-8 lg:p-12 shadow-2xl shadow-black/60 border border-outline-variant/10 bg-surface-container-low/40 backdrop-blur-md">
                 <label className="block text-xs font-label font-bold uppercase tracking-[0.3em] text-primary mb-8" htmlFor="vibe-input">
                    Initiate New Synthesis
                 </label>
                 <PromptInputBox 
                   onSend={(msg) => handleAnalyze(false, msg)}
                   isLoading={loading}
                   placeholder="e.g. A high-concurrency fintech platform requiring sub-100ms latency for global transactions..."
                 />
                 {error && <p className="mt-4 text-error text-sm font-medium">{error}</p>}
               </div>
            </div>

            {/* History Grid */}
            <div className="lg:col-span-12 space-y-8 pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" data-icon="history">history</span>
                  Synthesis Archive
                </h2>
                <div className="h-[1px] flex-1 mx-6 bg-white/5" />
              </div>

              {historyLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : explorations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {explorations.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectProject(item)}
                      className="group bg-surface-container-low rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
                    >
                      <h3 className="text-lg font-headline font-bold text-white group-hover:text-primary transition-colors mb-2">{item.name}</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 italic mb-6">"{item.result_json?.project_summary}"</p>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {item.stack.slice(0, 4).map((tech, i) => (
                          <div key={i} className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-tighter text-slate-400">
                            {tech}
                          </div>
                        ))}
                      </div>
                      
                      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-slate-500 italic">No stored syntheses found. Start by describing your vision above.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detail Selection View */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <button 
              onClick={() => setSelectedProject(null)}
              className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform" data-icon="arrow_back">arrow_back</span>
              Return to Archive
            </button>

            {isProcessingSelection ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary text-3xl animate-pulse" data-icon="auto_awesome">auto_awesome</span>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-headline font-bold text-white uppercase tracking-widest">Neural Mapping Active</h3>
                  <p className="text-slate-500 text-sm italic">Synthesizing architectural roadmap and fiscal projections...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Architecture Plan */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-surface-container-low p-8 rounded-3xl border border-white/10 space-y-6">
                    <div>
                      <span className="text-primary font-bold text-[10px] uppercase tracking-widest block mb-2">Technical Blueprint</span>
                      <h2 className="text-3xl font-headline font-black text-white leading-tight">{selectedProject.result_json?.project_title}</h2>
                    </div>
                    <p className="text-slate-400 leading-relaxed italic">"{selectedProject.result_json?.project_summary}"</p>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Complexity</span>
                        <span className="text-white font-bold">{selectedProject.result_json?.complexity}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Timeline</span>
                        <span className="text-white font-bold">{selectedProject.result_json?.estimated_timeline}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Confidence</span>
                        <span className="text-primary font-bold">{selectedProject.result_json?.confidence_score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" data-icon="terminal">terminal</span>
                      Core Infrastructure Stack
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedProject.result_json?.languages?.map((l: any, i: number) => (
                        <div key={i} className="p-4 bg-surface-container-low border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                          <TechIcon slug={l.icon} size={32} />
                          <span className="text-[10px] font-bold text-white uppercase">{l.name}</span>
                        </div>
                      ))}
                      {selectedProject.result_json?.frameworks?.map((f: any, i: number) => (
                        <div key={i} className="p-4 bg-surface-container-low border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                          <TechIcon slug={f.icon} size={32} />
                          <span className="text-[10px] font-bold text-white uppercase">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasks Roadmap & Export */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-surface-container-high p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-lg font-headline font-bold text-white uppercase tracking-widest flex items-center gap-2">
                         <span className="material-symbols-outlined text-primary" data-icon="route">route</span>
                         System Roadmap
                       </h3>
                    </div>
                    
                    <div className="space-y-6 relative ml-4">
                      <div className="absolute left-[-17px] top-2 bottom-2 w-[2px] bg-white/5" />
                      {selectedProject.result_json?.mvp_roadmap?.map((step: string, i: number) => (
                        <div key={i} className="relative group">
                          <div className="absolute left-[-22px] top-1.5 w-3 h-3 rounded-full bg-surface-container-high border-2 border-primary ring-4 ring-primary/10" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{step.split(':')[0]}</p>
                            <p className="text-sm text-slate-300 font-light leading-relaxed">{step.includes(':') ? step.split(':')[1].trim() : step}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
                      <button 
                        onClick={handleAddToProjects}
                        disabled={addingToProjects}
                        className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {addingToProjects ? (
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined font-black" data-icon="rocket_launch">rocket_launch</span>
                        )}
                        {addingToProjects ? 'Deploying...' : 'Add to My Projects'}
                      </button>
                      
                      <p className="text-[10px] text-center text-slate-500 uppercase font-bold tracking-widest animate-pulse">
                        {addStatus || "This will create a formal project and AI-assigned tasks"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Architecture;
