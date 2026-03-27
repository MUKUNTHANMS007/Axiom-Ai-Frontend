import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeProject } from '../services/api';
import { PromptInputBox } from '@/components/ai-prompt-box';
import { BeamsBackground } from '@/components/ui/beams-background';

const Dashboard = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from session
  const getUserId = () => {
    const localSession = localStorage.getItem("vibe_session");
    if (localSession) {
      const parsed = JSON.parse(localSession);
      return parsed.user?.name;
    }
    return null;
  };

  const handleAnalyze = async (isDemo: boolean = false, inputDesc?: string) => {
    const finalDesc = inputDesc || description;
    if (!finalDesc.trim() && !isDemo) return;
    
    // Also save the typed text back to state just in case
    if (inputDesc) setDescription(inputDesc);
    
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
        result = await analyzeProject({ description: finalDesc }, getUserId());
      }

      navigate('/recommendations', { state: { result } });
    } catch (err: any) {
      const errorMsg = err.message || 'Something went wrong during analysis';
      setError(errorMsg.includes('fetch') ? 'The AI engine is waking up... please try again in 30 seconds.' : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-12 py-16 relative">
      <BeamsBackground className="absolute inset-0 z-0 pointer-events-none opacity-100 mix-blend-screen" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-tertiary/5 blur-[100px] rounded-full"></div>
      </div>
      
      <div className="max-w-4xl w-full flex flex-col gap-12 items-center relative z-10">
        <div className="w-full flex flex-col gap-8 text-center items-center">
          <div className="space-y-4">
            <h1 className="text-6xl font-headline font-extrabold tracking-tighter text-white">
              Synthesize Your <span className="text-primary">Vision.</span>
            </h1>
            <p className="text-on-surface-variant text-xl max-w-2xl font-light mx-auto">
              Describe the core essence and requirements of your project. Our engine will map the optimal architectural stack in seconds.
            </p>
          </div>
          <div className="glass-panel w-full rounded-2xl p-10 shadow-2xl shadow-black/60 border border-outline-variant/20 bg-surface-container-low/40 backdrop-blur-md">
            <div className="relative">
              <label className="block text-xs font-label font-bold uppercase tracking-widest text-primary mb-6" htmlFor="vibe-input">
                Describe your project vibe...
              </label>
              <PromptInputBox 
                onSend={(msg) => handleAnalyze(false, msg)}
                isLoading={loading}
                placeholder="e.g. A high-concurrency fintech platform requiring sub-100ms latency for global transactions..."
              />
              
              {error && <p className="mt-4 text-error text-sm font-medium">{error}</p>}
              
              <div className="mt-8 flex justify-center items-center">
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-xs font-label text-slate-500">
                    <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`} data-icon="auto_awesome">
                      {loading ? 'progress_activity' : 'auto_awesome'}
                    </span>
                    {loading ? 'AI Engine is Analyzing...' : 'AI-Assisted Drafting Active'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-outline-variant/10 flex items-center justify-center">
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
      </div>
    </div>
  );
};

export default Dashboard;
