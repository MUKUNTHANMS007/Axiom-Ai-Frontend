import { Link } from 'react-router-dom';
import { HeroSection } from '../components/hero-section-2';
import { motion } from 'framer-motion';

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

        {/* High-Fidelity Feature Showcase */}
        <section id="platform-tour" className="py-24 px-6 bg-background relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-32">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-6">A Guided Tour of Infinite Scale</h2>
              <p className="text-on-surface-variant text-lg font-mono uppercase tracking-widest opacity-60 italic">From logic to deployment, every stage of the lifecycle is orchestrated by agentic intelligence.</p>
            </div>

            {/* Feature 1: AI Synthesis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h4 className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Step 01: Intelligence at Source</h4>
                  <h3 className="font-headline text-3xl md:text-5xl font-black text-white leading-none">Architectural Synthesis</h3>
                  <div className="h-0.5 w-24 bg-primary/30"></div>
                </div>
                <p className="text-on-surface-variant text-lg leading-relaxed border-l-2 border-primary/20 pl-8">
                  Convert complex business requirements into structured engineering blueprints instantly. Our engine maps your logic to the most efficient language and framework stacks, generating a complete MVP roadmap before a single line of code is written.
                </p>
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                  <h5 className="text-[10px] font-black uppercase text-white mb-2 tracking-widest">The Why</h5>
                  <p className="text-on-surface text-sm opacity-80 leading-relaxed italic">Eliminates "Choice Paralysis" and technical debt by ensuring your foundation is built on verified architectural standards tailored to your specific load targets.</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative glass-panel p-2 rounded-3xl border border-white/5 shadow-2xl shadow-primary/10 group overflow-hidden"
              >
                <img src="/showcase/synthesis.png" alt="Architecture Synthesis" className="rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40"></div>
              </motion.div>
            </div>

            {/* Feature 2: Team Synergy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative glass-panel p-2 rounded-3xl border border-white/5 shadow-2xl shadow-secondary/10 group overflow-hidden lg:order-1 order-2"
              >
                <img src="/showcase/synergy.png" alt="Team Synergy" className="rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40"></div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8 lg:order-2 order-1"
              >
                <div className="space-y-4">
                  <h4 className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Step 02: Human-Technical Alignment</h4>
                  <h3 className="font-headline text-3xl md:text-5xl font-black text-white leading-none">Synergy Analytics</h3>
                  <div className="h-0.5 w-24 bg-secondary/30"></div>
                </div>
                <p className="text-on-surface-variant text-lg leading-relaxed border-l-2 border-secondary/20 pl-8">
                  Monitor the "Vibe Score" of your technical workforce. Axiom analyzes real-time telemetry from your team's active nodes to identify skill-gaps (DevOps, Security, Backend) and predicts synergy bottlenecks before they impact deployment velocity.
                </p>
                <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/20">
                  <h5 className="text-[10px] font-black uppercase text-white mb-2 tracking-widest">The Why</h5>
                  <p className="text-on-surface text-sm opacity-80 leading-relaxed italic">Software isn't just code; it's people. By mapping the right minds to the right architectural nodes, we maximize velocity while avoiding burnout and misalignment.</p>
                </div>
              </motion.div>
            </div>

            {/* Feature 3: Engineering Workflow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h4 className="text-tertiary font-black uppercase tracking-[0.4em] text-[10px]">Step 03: Agentic Execution</h4>
                  <h3 className="font-headline text-3xl md:text-5xl font-black text-white leading-none">Real-Time Workflow</h3>
                  <div className="h-0.5 w-24 bg-tertiary/30"></div>
                </div>
                <p className="text-on-surface-variant text-lg leading-relaxed border-l-2 border-tertiary/20 pl-8">
                  Maintain a live pulse of every synthesis, blueprint save, and task evolution. Our agentic workflow engine tracks the DNA of your project as it evolves, ensuring that every deployment is backed by a verified audit trail of architectural decisions.
                </p>
                <div className="bg-tertiary/5 p-6 rounded-2xl border border-tertiary/20">
                  <h5 className="text-[10px] font-black uppercase text-white mb-2 tracking-widest">The Why</h5>
                  <p className="text-on-surface text-sm opacity-80 leading-relaxed italic">Absolute transparency into project maturity. Teams can visualize the 'Task Evolution' in real-time, allowing lead architects to focus on strategy while the AI manages operational status.</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative glass-panel p-2 rounded-3xl border border-white/5 shadow-2xl shadow-tertiary/10 group overflow-hidden"
              >
                <img src="/showcase/workflow.png" alt="Engineering Workflow" className="rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40"></div>
              </motion.div>
            </div>

            {/* Feature 4: Shared Memory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative glass-panel p-2 rounded-3xl border border-white/5 shadow-2xl shadow-primary/10 group overflow-hidden lg:order-1 order-2"
              >
                <img src="/showcase/history.png" alt="Shared Memory" className="rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40"></div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8 lg:order-2 order-1"
              >
                <div className="space-y-4">
                  <h4 className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Step 04: Collective Pattern Intelligence</h4>
                  <h3 className="font-headline text-3xl md:text-5xl font-black text-white leading-none">Shared Pattern Memory</h3>
                  <div className="h-0.5 w-24 bg-primary/30"></div>
                </div>
                <p className="text-on-surface-variant text-lg leading-relaxed border-l-2 border-primary/20 pl-8">
                  Never reinvent the wheel. Our history engine archives every organizational blueprint and synthesis, allowing your entire workforce to stand on the shoulders of past technical successes. Shared project history ensures knowledge remains persistent even as teams evolve.
                </p>
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                  <h5 className="text-[10px] font-black uppercase text-white mb-2 tracking-widest">The Why</h5>
                  <p className="text-on-surface text-sm opacity-80 leading-relaxed italic">Prevents technical duplication and siloed knowledge. New project members can immediately access the 'Architectural Archive' to understand the rationale behind your existing infrastructure.</p>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* Bento Grid - Features */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white uppercase italic">Engineered for Precision</h2>
              <p className="text-on-surface-variant text-lg font-mono tracking-tighter uppercase opacity-60">Infrastructure choices are no longer a guessing game.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 flex flex-col border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary">hub</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">Smart Framework Matching</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">Analyze your business logic requirements to find the exact language and framework ecosystem that reduces technical debt.</p>
              </div>
              <div className="group p-8 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 flex flex-col relative overflow-hidden border border-white/5">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary">insights</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">AI-Driven Platform Insights</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">Get telemetry projections on how your stack will perform across AWS, GCP, or Azure based on real-world benchmarks.</p>
              </div>
              <div className="group p-8 rounded-xl bg-surface-container-highest flex flex-col border border-primary/20 shadow-[0_0_50px_rgba(182,160,255,0.05)]">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>architecture</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">Optimized Scalability</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">Auto-generate configuration tailored to your specific application load and latency targets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-32 px-6 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-white uppercase italic">Technical Verticals</h2>
                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-surface-container border border-white/5">
                    <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">FinTech & Secure Core</h4>
                    <p className="text-on-surface text-sm">Optimized architectures for high-frequency trading, secure transaction processing, and PCI-DSS compliant infrastructure.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-surface-container border border-white/5">
                    <h4 className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] mb-2">E-Commerce at Scale</h4>
                    <p className="text-on-surface text-sm">Edge-cached storefronts with rapid inventory synchronization and global CDN strategies.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-surface-container border border-white/5">
                    <h4 className="text-tertiary font-black uppercase tracking-[0.2em] text-[10px] mb-2">SaaS Multi-tenancy</h4>
                    <p className="text-on-surface text-sm">Isolation patterns and data-sharding blueprints for horizontal growth and tenant reliability.</p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square glass-panel rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                <span className="material-symbols-outlined text-[120px] text-white/10" style={{fontVariationSettings: "'wght' 100"}}>hub</span>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 border border-white/5 rounded-full animate-pulse-slow"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white uppercase italic">Subscription Tiers</h2>
              <p className="text-on-surface-variant text-lg font-mono tracking-tighter uppercase opacity-60">Access superior engineering intelligence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Architect', price: 'Free', features: ['3 Project Syntheses', 'Core Framework Matching', 'Standard Export'] },
                { name: 'Engineer', price: '$49', features: ['Unlimited Syntheses', 'Advanced Telemetry', 'Priority AI Models', 'PDF Blueprint Export'] },
                { name: 'Enterprise', price: 'Custom', features: ['Team Workspace Sync', 'White-labeled Reporting', 'Dedicated LLM Nodes', 'SSO Integration'] }
              ].map((tier, i) => (
                <div key={i} className={`p-10 rounded-3xl border ${i === 1 ? 'bg-primary/5 border-primary/30 shadow-2xl shadow-primary/10' : 'bg-surface-container border-white/5'} flex flex-col`}>
                  <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary mb-6">{tier.name}</h4>
                  <div className="flex items-baseline gap-1 mb-10">
                    <span className="text-5xl font-headline font-black text-white">{tier.price}</span>
                    {tier.price.startsWith('$') && <span className="text-on-surface-variant font-bold">/mo</span>}
                  </div>
                  <ul className="space-y-4 mb-12 flex-grow">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-on-surface/80">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${i === 1 ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                    Choose {tier.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-6 mb-32">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase italic">Our Intelligence</h2>
            <p className="text-on-surface-variant text-xl leading-relaxed italic border-x border-primary/20 px-12">
              Axiom AI was founded on a singular premise: that high-performance engineering should not be a secret. 
              We leverage agentic models to demystify complex infrastructure, allowing founders to focus on product values rather than architectural stress.
            </p>
            <div className="flex justify-center gap-20 py-12 border-y border-white/5">
              <div className="text-center">
                <p className="text-3xl font-headline font-black text-white leading-none mb-2">99.8%</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Uptime Projection</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-headline font-black text-white leading-none mb-2">4.2k</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Stacks Generated</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-headline font-black text-white leading-none mb-2">12ms</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Synthesis Latency</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-surface-container-lowest border-y border-outline-variant/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#b6a0ff 1px, transparent 1px)", backgroundSize: "32px 32px"}}></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter text-white uppercase italic">Ready to Deploy Your Legacy?</h2>
            <p className="text-on-surface-variant text-xl mb-12 font-mono uppercase tracking-tighter opacity-60">Join 4,000+ founders using Axiom AI to build the next generation of digital infrastructure.</p>
            <Link to="/signup" className="px-12 py-6 bg-white text-black rounded-md font-label font-extrabold uppercase tracking-widest hover:bg-primary transition-all hover:text-white shadow-xl">
              Get Beta Access
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
