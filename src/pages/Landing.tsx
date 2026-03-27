import { Link } from 'react-router-dom';
import { HeroSection } from '../components/hero-section-2';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tertiary/10 blur-[100px] rounded-full"></div>
      </div>

      <main className="relative z-10 overflow-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* Bento Grid */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Engineered for Precision</h2>
              <p className="text-on-surface-variant text-lg">Infrastructure choices are no longer a guessing game.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary">hub</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">Smart Framework Matching</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">Analyze your business logic requirements to find the exact language and framework ecosystem that reduces technical debt.</p>
              </div>
              <div className="group p-8 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 flex flex-col relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary">insights</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">AI-Driven Platform Insights</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">Get telemetry projections on how your stack will perform across AWS, GCP, or Azure based on real-world benchmarks.</p>
              </div>
              <div className="group p-8 rounded-xl bg-surface-container-highest flex flex-col border border-primary/20 shadow-[0_0_50px_rgba(182,160,255,0.05)]">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>architecture</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">Optimized Scalability</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">Auto-generate configuration tailored to your specific application load and latency targets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-surface-container-lowest border-y border-outline-variant/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#b6a0ff 1px, transparent 1px)", backgroundSize: "32px 32px"}}></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter text-white">Ready to Deploy Your Legacy?</h2>
            <p className="text-on-surface-variant text-xl mb-12">Join 4,000+ founders using ArchIntel to build the next generation of digital infrastructure.</p>
            <Link to="/dashboard" className="px-12 py-6 bg-white text-black rounded-md font-label font-extrabold uppercase tracking-widest hover:bg-primary transition-all hover:text-on-primary-fixed shadow-xl">
              Get Beta Access
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
