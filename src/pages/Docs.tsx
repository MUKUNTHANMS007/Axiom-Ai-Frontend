import { BeamsBackground } from '../components/ui/beams-background';
import { AnimatedGroup } from '../components/ui/animated-group';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';

const Docs = () => {
  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: 'rocket_launch',
      content: 'Axiom AI (Aether) is a next-generation agentic engineering platform designed to streamline infrastructure decision-making. By combining multi-model AI inference with real-world telemetry, we help founders and engineers build scalable, cost-effective digital legacies.',
    },
    {
      id: 'dashboard',
      title: 'Synthesis Dashboard',
      icon: 'dashboard',
      content: 'The Synthesis Dashboard is your command center. Input your project "vibe"—including technical requirements, budget constraints, and team expertise—to receive a comprehensive architectural roadmap. Our engine analyzes thousands of possible stack combinations to find your perfect match.',
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      icon: 'groups',
      content: 'Aether simplifies team management through integrated workspaces. Share your synthesized stacks, invite collaborators via secure tokens, and assign AI-optimized tasks. Our system ensures everyone stays aligned on the technical vision.',
    },
    {
      id: 'ai-logic',
      title: 'The AI Engine',
      icon: 'psychology',
      content: 'Our proprietary engine uses advanced LLMs (Groq, Llama 3, OpenAI) to perform deep architectural analysis. It doesn\'t just suggest tools; it evaluates market opportunities, potential risks, and provides a clear MVP roadmap with budget projections.',
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: 'security',
      content: 'Enterprise-grade security is baked into Aether. All data is managed through Supabase with strict Row-Level Security (RLS). Your architectural blueprints and team data are encrypted and accessible only to authorized members.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-20">
      <BeamsBackground className="opacity-40" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32">
        <div className="mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 py-1 px-4 text-xs font-bold tracking-widest uppercase">Documentation</Badge>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Master the Engine.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-label">
            Everything you need to know about building, scaling, and managing your infrastructure with Axiom AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 border-r border-white/5 pr-8 hidden lg:block sticky top-32 h-fit">
            <nav className="flex flex-col gap-4">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-slate-500 hover:text-white transition-colors text-sm font-label flex items-center gap-3 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all"></span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatedGroup className="flex flex-col gap-24">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-32">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">{section.icon}</span>
                    </div>
                    <h2 className="text-3xl font-bold font-headline">{section.title}</h2>
                  </div>
                  
                  <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full shimmer-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-lg text-slate-300 leading-relaxed font-body">
                      {section.content}
                    </p>
                    
                    {section.id === 'ai-logic' && (
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                          <h4 className="font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                            <span className="material-symbols-outlined text-xs">analytics</span> Performance
                          </h4>
                          <p className="text-xs text-slate-500">Real-time telemetry analysis across major cloud providers.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                          <h4 className="font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                            <span className="material-symbols-outlined text-xs">savings</span> Efficiency
                          </h4>
                          <p className="text-xs text-slate-500">Automated budget optimization for early-stage startups.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="mt-16 bg-white/5" />
                </section>
              ))}
            </AnimatedGroup>
            
            <footer className="mt-32 p-12 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 text-center">
              <h3 className="text-2xl font-bold mb-4 font-headline text-white">Need deeper integration?</h3>
              <p className="text-slate-400 mb-8 font-label">Our enterprise support team is ready to help you architect your legacy.</p>
              <button className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest text-xs">
                Contact Support
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
