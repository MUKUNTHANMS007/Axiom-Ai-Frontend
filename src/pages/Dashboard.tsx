import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeProject } from '../services/api';
import type { ProjectInput } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (isDemo: boolean = false) => {
    if (!description.trim() && !isDemo) return;
    
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isDemo) {
        // Mock data for demonstration purposes
        result = {
          project_title: "Aether Flux",
          project_summary: "A high-performance real-time collaborative platform using edge computing and serverless architecture for global scale.",
          complexity: "High",
          estimated_timeline: "8-12 weeks",
          confidence_score: 94,
          languages: [
            { name: "TypeScript", icon: "🟦", reason: "Type safety and ecosystem", match: 98, use_case: "Frontend & Backend" },
            { name: "Rust", icon: "🦀", reason: "Performance and memory safety", match: 85, use_case: "Edge Computing" }
          ],
          frameworks: [
            { name: "Next.js", icon: "▲", category: "Frontend", reason: "SSR and routing", match: 95, docs_url: "#", learning_curve: "Moderate" },
            { name: "FastAPI", icon: "⚡", category: "Backend", reason: "High performance API", match: 92, docs_url: "#", learning_curve: "Easy" }
          ],
          deploy_platforms: [
            { name: "Vercel", icon: "▲", type: "PaaS", purpose: "Frontend hosting", pricing: "Freemium", monthly_estimate: "$0-20", budget_fit: "Excellent", scalability: "High", free_tier: true, best_for: "Quick deployment and high speed" }
          ],
          budget_breakdown: { minimum: "$0", recommended: "$45/mo", at_scale: "$200/mo", note: "Starting with free tiers for MVP" },
          architecture_patterns: [
            { name: "Serverless Microservices", recommended: true, pros: ["Infinite scalability", "Pay per use"], cons: ["Cold starts", "Complex debugging"] }
          ],
          potential_risks: ["Data synchronization conflicts", "Latency in some regions"],
          key_considerations: ["Offline support", "State management"],
          mvp_roadmap: ["Step 1: Auth and simple real-time sync", "Step 2: Core editor logic", "Step 3: Scaling"]
        };
      } else {
        result = await analyzeProject({ description });
      }
      navigate('/recommendations', { state: { result } });
    } catch (err: any) {
      setError(err.message || 'Something went wrong during analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-12 py-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-tertiary/10 blur-[100px] rounded-full"></div>
      </div>
      
      <div className="max-w-6xl w-full grid grid-cols-12 gap-12 items-start relative z-10">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white">
              Synthesize Your <span className="text-primary">Vision.</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl font-light">
              Describe the core essence and requirements of your project. Our engine will map the optimal architectural stack in seconds.
            </p>
          </div>
          <div className="glass-panel rounded-xl p-8 shadow-2xl shadow-black/40 border border-outline-variant/20">
            <div className="relative">
              <label className="block text-xs font-label font-bold uppercase tracking-widest text-primary mb-4" htmlFor="vibe-input">
                Describe your project vibe...
              </label>
              <textarea 
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6 text-on-surface font-body text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-slate-600 resize-none disabled:opacity-50" 
                id="vibe-input" 
                placeholder="e.g. A high-concurrency fintech platform requiring sub-100ms latency for global transactions..." 
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              ></textarea>
              
              {error && <p className="mt-4 text-error text-sm font-medium">{error}</p>}
              
              <div className="mt-8 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-xs font-label text-slate-500">
                    <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`} data-icon="auto_awesome">
                      {loading ? 'progress_activity' : 'auto_awesome'}
                    </span>
                    {loading ? 'AI Engine is Analyzing...' : 'AI-Assisted Drafting Active'}
                  </span>
                </div>
                <button 
                  onClick={() => handleAnalyze(false)}
                  disabled={loading || !description.trim()}
                  className="group relative px-8 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary-fixed font-headline font-bold text-sm uppercase tracking-widest rounded-md overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(182,160,255,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? 'Synthesizing...' : 'Analyze Vibe & Generate Stack'}
                    {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center justify-center">
               <button 
                 onClick={() => handleAnalyze(true)}
                 disabled={loading}
                 className="text-xs font-label text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-sm" data-icon="rocket_launch">rocket_launch</span>
                 Don't have API keys? Try the <span className="underline font-bold">Interactive Demo Flow</span>
               </button>
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Side Panels - Simplified for Integration */}
          <div className="p-6 rounded-xl bg-surface-container-high relative overflow-hidden border border-outline-variant/10">
            <div className="absolute left-0 top-0 bottom-0 shimmer-accent"></div>
            <h3 className="font-headline font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" data-icon="tips_and_updates">tips_and_updates</span>
              Blueprint Suggestions
            </h3>
            <div className="space-y-4">
              {["Scaling for 1M+ concurrent users globally...", "Requires WebSockets for live collaborative editing...", "Native connectivity with Stripe and Salesforce...", "Preference for AWS Serverless or GCP Anthos..."].map((s, i) => (
                <div key={i} className="group p-4 bg-surface-container-lowest rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer" onClick={() => setDescription(prev => prev ? prev + " " + s : s)}>
                  <p className="text-sm text-on-surface-variant font-light">"{s}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
