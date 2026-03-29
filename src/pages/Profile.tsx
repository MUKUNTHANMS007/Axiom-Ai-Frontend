import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User as UserIcon, 
  MapPin, 
  Globe, 
  Link as LinkIcon, 
  Mail, 
  ExternalLink, 
  Edit3,
  Code2,
  Cpu,
  Zap,
  ChevronRight,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { fetchHistory, fetchAnalytics } from "@/services/api";
import type { HistoryItem, AnalyticsData } from "@/services/api";

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let targetId = userId;
                
                // Fetch current user from Supabase if no ID in URL
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!targetId && authUser) {
                    targetId = authUser.id;
                }

                if (!targetId) {
                    navigate("/login");
                    return;
                }

                setIsOwnProfile(authUser?.id === targetId);

                const { data, error } = await supabase
                    .from('User')
                    .select('*')
                    .eq('User Id', targetId)
                    .maybeSingle();

                if (error) throw error;
                setUser(data);

                // Fetch real-time metrics and history
                const [historyData, analyticsData] = await Promise.all([
                    fetchHistory(targetId),
                    fetchAnalytics(targetId)
                ]);
                setHistory(historyData);
                setAnalytics(analyticsData);
            } catch (err) {
                console.error("Error fetching profile metrics:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId, navigate]);

    const calculateRank = (total: number) => {
        if (total >= 150) return { label: "DIAMOND", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
        if (total >= 50) return { label: "PLATINUM", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
        if (total >= 10) return { label: "GOLD", class: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
        return { label: "BRONZE", class: "bg-slate-500/10 text-slate-500 border-slate-500/20" };
    };

    const rank = calculateRank(analytics?.total_syntheses || 0);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-muted rounded-full"></div>
                    <div className="h-4 w-48 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Architect Not Found</h2>
                    <p className="text-muted-foreground mb-4">The signal from this coordinate is lost or corrupted.</p>
                    <Button asChild><Link to="/dashboard">Return to Dashboard</Link></Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground pb-20 transition-colors duration-500 relative">

            <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12">
                {/* Hero section */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden glass-card rounded-[2.5rem] p-8 md:p-12 mb-8 border-border/10 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative group">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-40 h-40 rounded-[2rem] bg-gradient-to-br from-primary/30 to-indigo-600/30 flex items-center justify-center border-2 border-primary/20 shadow-2xl overflow-hidden backdrop-blur-3xl relative"
                            >
                                {user['Photo URL'] ? (
                                    <img 
                                        src={user['Photo URL']} 
                                        alt={user['User Name']} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="w-20 h-20 text-primary" />
                                )}
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center shadow-lg">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left pt-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-headline font-black tracking-tighter uppercase mb-2 break-all">
                                        {user['User Name']}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold tracking-widest uppercase text-[10px] px-3">
                                            {user['Role'] || "Aether Architect"}
                                        </Badge>
                                        {user['Location'] && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                                <MapPin className="w-3 h-3" />
                                                {user['Location']}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {isOwnProfile && (
                                    <Button asChild variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/10 transition-all">
                                        <Link to="/settings" className="flex items-center gap-2">
                                            <Edit3 className="w-4 h-4" />
                                            Edit Protocol
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            <Separator className="my-6 opacity-30" />

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                {user['GitHub URL'] && (
                                    <a href={user['GitHub URL']} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all border border-border/50 text-xs font-bold uppercase tracking-widest">
                                        <Globe className="w-4 h-4" /> GitHub
                                    </a>
                                )}
                                {user['LinkedIn URL'] && (
                                    <a href={user['LinkedIn URL']} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all border border-border/50 text-xs font-bold uppercase tracking-widest">
                                        <LinkIcon className="w-4 h-4" /> LinkedIn
                                    </a>
                                )}
                                {user['Portfolio URL'] && (
                                    <a href={user['Portfolio URL']} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                                        <Globe className="w-4 h-4" /> Portfolio <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Stats */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass-card p-6 border-border/10 rounded-[2rem]">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-primary" /> System Metrics
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saved Stacks</span>
                                        <span className="text-xl font-black tracking-widest">{analytics?.total_saved_stacks || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Axioms Synthesized</span>
                                        <span className="text-xl font-black tracking-widest">{analytics?.total_syntheses || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Engine Rank</span>
                                        <Badge className={`font-bold uppercase text-[9px] ${rank.class}`}>{rank.label}</Badge>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card p-6 border-border/10 rounded-[2rem]">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Access Layer</h3>
                                <button 
                                    onClick={() => window.location.href = `mailto:${user['Email'] || 'mukunthan@axiom.ai'}?subject=Architectural Collaboration: ${user['User Name']}`}
                                    className="w-full h-12 rounded-xl bg-muted border border-border flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                                >
                                    <Mail className="w-4 h-4" /> Open Comms Channel
                                </button>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Technical Radar (Skills) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass-card p-8 border-border/10 rounded-[2rem]">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                                    <Code2 className="w-4 h-4" /> Technical DNA
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {/* Show manual skills first, then computed skills from history if empty */}
                                    {((user['Skills'] && user['Skills'].length > 0) ? user['Skills'] : (
                                        Array.from(new Set(history.flatMap(h => [
                                            ...(h.result_json.languages?.map(l => l.name) || []),
                                            ...(h.result_json.frameworks?.map(f => f.name) || [])
                                        ]))).slice(0, 10)
                                    )).map((skill: string) => (
                                        <Badge key={skill} className="px-4 py-2 bg-muted border border-border/50 text-foreground font-black uppercase tracking-widest text-[10px] hover:border-primary/50 transition-all duration-300">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {(!user['Skills'] || user['Skills'].length === 0) && history.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">No technical protocols synthesized yet.</p>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Recent Synthesis (Activity/Projects placeholder) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card p-8 border-border/10 rounded-[2rem]">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Recent Syntheses
                                </h3>
                                <div className="space-y-4">
                                    {history.length > 0 ? history.slice(0, 5).map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="group p-4 rounded-2xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between"
                                            onClick={() => navigate('/recommendations', { state: { result: item.result_json } })}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Zap className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold uppercase tracking-tight">{item.name}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                        Synthesis Score: {item.score} • {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 opacity-50 italic text-xs uppercase tracking-widest font-bold">
                                            No synthesis protocols recorded yet.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
