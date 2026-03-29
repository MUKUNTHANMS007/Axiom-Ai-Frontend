import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, 
  Shield, 
  Database, 
  LogOut, 
  Check, 
  ChevronRight,
  Cpu,
  Save,
  Loader2,
  AlertCircle,
  Globe, 
  Link as LinkIcon,
  MapPin,
  Camera,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type SettingsTab = "profile" | "integrations" | "security";

const Settings = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Form state
    const [profile, setProfile] = useState({
        name: "",
        role: "",
        location: "",
        skills: [] as string[],
        github: "",
        linkedin: "",
        portfolio: "",
        email: "mukunthan@axiom.ai",
        photo_url: ""
    });

    const [skillInput, setSkillInput] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const applyTheme = () => {
        // Force Dark Mode to preserve background animations
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#0b0b0d';
    };

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const sessionStr = localStorage.getItem("vibe_session");
                if (!sessionStr) {
                    navigate("/login");
                    return;
                }

                const session = JSON.parse(sessionStr);
                const userId = session.user.id;

                const { data, error } = await supabase
                    .from('User')
                    .select('*')
                    .eq('User Id', userId)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    setProfile({
                        name: data['User Name'] || "",
                        role: data['Role'] || "Software Architect",
                        location: data['Location'] || "",
                        skills: data['Skills'] || [],
                        github: data['GitHub URL'] || "",
                        linkedin: data['LinkedIn URL'] || "",
                        portfolio: data['Portfolio URL'] || "",
                        email: "mukunthan@axiom.ai",
                        photo_url: data['Photo URL'] || ""
                    });
                    applyTheme();
                }
            } catch (err: any) {
                console.error("Error fetching settings:", err);
                setError(err.message || "Failed to load settings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const sessionStr = localStorage.getItem("vibe_session");
            const session = JSON.parse(sessionStr!);
            const userId = session.user.id;

            const { error: updateError } = await supabase
                .from('User')
                .upsert({
                    'User Id': userId,
                    'User Name': profile.name,
                    'Role': profile.role,
                    'Location': profile.location,
                    'Skills': profile.skills,
                    'GitHub URL': profile.github,
                    'LinkedIn URL': profile.linkedin,
                    'Portfolio URL': profile.portfolio,
                    'Photo URL': profile.photo_url,
                    'Theme': 'dark'
                })
                .eq('User Id', userId);

            if (updateError) throw updateError;

            // Update localStorage session
            const updatedSession = { ...session, user: { ...session.user, 'Photo URL': profile.photo_url, 'Theme': 'dark' } };
            localStorage.setItem("vibe_session", JSON.stringify(updatedSession));

            applyTheme();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err: any) {
            console.error("Error saving settings:", err);
            setError(err.message || "Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem("vibe_session");
        await supabase.auth.signOut();
        navigate("/");
        window.location.reload();
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        setError(null);
        try {
            const sessionStr = localStorage.getItem("vibe_session");
            const session = JSON.parse(sessionStr!);
            const userId = session.user.id;
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update local state
            setProfile(prev => ({ ...prev, photo_url: publicUrl }));
            
            // 4. Update Database immediately for better UX
            await supabase
                .from('User')
                .update({ 'Photo URL': publicUrl })
                .eq('User Id', userId);

            // 5. Update localStorage
            const sessionStr2 = localStorage.getItem("vibe_session");
            const session2 = JSON.parse(sessionStr2!);
            session2.user['Photo URL'] = publicUrl;
            localStorage.setItem("vibe_session", JSON.stringify(session2));

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err: any) {
            console.error("Error uploading photo:", err);
            setError(err.message || "Failed to upload photo. Ensure 'avatars' bucket exists and is public.");
        } finally {
            setIsSaving(false);
        }
    };

    const removePhoto = async () => {
        setProfile(prev => ({ ...prev, photo_url: "" }));
        // Update DB
        const sessionStr = localStorage.getItem("vibe_session");
        const session = JSON.parse(sessionStr!);
        await supabase
            .from('User')
            .update({ 'Photo URL': "" })
            .eq('User Id', session.user.id);
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!profile.skills.includes(skillInput.trim())) {
                setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
            }
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
    };

    const sidebarItems = [
        { id: "profile", label: "Profile", icon: UserIcon },
        { id: "integrations", label: "Integrations", icon: Database },
        { id: "security", label: "Security", icon: Shield },
    ];

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Synchronizing Environment...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-72px)] bg-background text-foreground transition-colors duration-500">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-2">Command Center</h1>
                    <p className="text-muted-foreground font-body text-lg max-w-2xl">Configure your technical DNA and environment parameters.</p>
                </header>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex flex-col gap-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as SettingsTab)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    activeTab === item.id 
                                        ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.15)]" 
                                        : "hover:bg-muted text-muted-foreground border border-transparent"
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-semibold text-sm uppercase tracking-wider">{item.label}</span>
                                {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </button>
                        ))}
                        <Separator className="my-4" />
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 border border-transparent transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-semibold text-sm uppercase tracking-wider text-inherit">Sign Out</span>
                        </button>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full"
                            >
                                <div className="glass-card rounded-[2rem] p-8 lg:p-12 relative overflow-hidden border-border/5">
                                    {/* Decorative subtle glow */}
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                                    {activeTab === "profile" && (
                                        <div className="space-y-8">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                                    <UserIcon className="text-primary" />
                                                    Architect Profile
                                                </h2>
                                                <p className="text-muted-foreground text-sm">Update your public identity in the network.</p>
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                                <div className="relative group">
                                                    <div className="w-32 h-32 rounded-3xl bg-primary/20 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary transition-all overflow-hidden shadow-2xl relative">
                                                        {profile.photo_url ? (
                                                            <img 
                                                                src={profile.photo_url} 
                                                                alt="Profile" 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "";
                                                                    setProfile(prev => ({...prev, photo_url: ""}));
                                                                }}
                                                            />
                                                        ) : (
                                                            <UserIcon className="w-16 h-16 text-primary" />
                                                        )}
                                                        <div 
                                                            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            <Camera className="w-6 h-6 text-white mb-1" />
                                                            <span className="text-[10px] font-bold uppercase text-white">Update</span>
                                                        </div>
                                                    </div>
                                                    {profile.photo_url && (
                                                        <button 
                                                            onClick={removePhoto}
                                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                     )}
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef}
                                                        onChange={handlePhotoUpload}
                                                        className="hidden" 
                                                        accept="image/*"
                                                    />
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Name</Label>
                                                        <Input 
                                                            value={profile.name} 
                                                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                                                            className="h-11 focus:border-primary/50"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location Reference</Label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input 
                                                                placeholder="San Francisco, CA"
                                                                value={profile.location} 
                                                                onChange={(e) => setProfile({...profile, location: e.target.value})}
                                                                className="pl-10 h-11 focus:border-primary/50"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technical Role</Label>
                                                        <Input 
                                                            value={profile.role} 
                                                            onChange={(e) => setProfile({...profile, role: e.target.value})}
                                                            className="h-11 focus:border-primary/50"
                                                        />
                                                    </div>
                                                    
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-primary">Technical Radar (Skills)</Label>
                                                        <div className="space-y-3">
                                                            <div className="flex flex-wrap gap-2 min-h-[44px] p-2 rounded-xl bg-muted border border-border">
                                                                {profile.skills.map(skill => (
                                                                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-tight border border-primary/30">
                                                                        {skill}
                                                                        <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">×</button>
                                                                    </span>
                                                                ))}
                                                                <input 
                                                                    placeholder="Add skill..."
                                                                    className="bg-transparent border-none outline-none text-xs flex-1 min-w-[100px] text-foreground"
                                                                    value={skillInput}
                                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                                    onKeyDown={addSkill}
                                                                />
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground italic">Press Enter to add skills like React, Python, ML, etc.</p>
                                                        </div>
                                                    </div>

                                                    <Separator className="md:col-span-2" />

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GitHub Profile</Label>
                                                        <div className="relative">
                                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input 
                                                                placeholder="github.com/username"
                                                                value={profile.github} 
                                                                onChange={(e) => setProfile({...profile, github: e.target.value})}
                                                                className="pl-10 h-11 focus:border-primary/50"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">LinkedIn Network</Label>
                                                        <div className="relative">
                                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input 
                                                                placeholder="linkedin.com/in/username"
                                                                value={profile.linkedin} 
                                                                onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                                                                className="pl-10 h-11 focus:border-primary/50"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Portfolio / Project Hub</Label>
                                                        <div className="relative">
                                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input 
                                                                placeholder="https://my-work.com"
                                                                value={profile.portfolio} 
                                                                onChange={(e) => setProfile({...profile, portfolio: e.target.value})}
                                                                className="pl-10 h-11 focus:border-primary/50"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "integrations" && (
                                        <div className="space-y-8">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                                    <Database className="text-primary" />
                                                    External Modules
                                                </h2>
                                                <p className="text-muted-foreground text-sm">Manage connections to your backend services and AI providers.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                                <div className="p-6 rounded-3xl bg-muted border border-border hover:border-primary/30 transition-all group">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3 text-emerald-500">
                                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                                <Database className="w-6 h-6" />
                                                            </div>
                                                            <span className="font-black uppercase tracking-tighter text-lg">Supabase</span>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase">Connected</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-6">Database persistence and authentication backbone.</p>
                                                    <Button variant="ghost" className="w-full justify-between h-10 border border-border px-4 font-bold uppercase text-[10px] tracking-widest">
                                                        Configuration Keys
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="p-6 rounded-3xl bg-muted border border-border hover:border-primary/30 transition-all group">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3 text-orange-500">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                                <Cpu className="w-6 h-6" />
                                                            </div>
                                                            <span className="font-black uppercase tracking-tighter text-lg">Groq AI</span>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-widest leading-none">Llama-3.3-70B</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-6">Neural synthesis and agentic reasoning engine.</p>
                                                    <Button variant="ghost" className="w-full justify-between h-10 border border-border px-4 font-bold uppercase text-[10px] tracking-widest">
                                                        Engine Settings
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "security" && (
                                        <div className="space-y-8">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                                    <Shield className="text-primary" />
                                                    Encryption & Access
                                                </h2>
                                                <p className="text-muted-foreground text-sm">Secure your session keys and authentication protocols.</p>
                                            </div>

                                            <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-3xl space-y-4">
                                                <h3 className="text-destructive font-bold text-sm uppercase tracking-widest">Protocol Override</h3>
                                                <p className="text-xs text-muted-foreground">Warning: Terminating current session will decrypt active environment keys from local memory.</p>
                                                <Button 
                                                    onClick={handleLogout}
                                                    className="bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-xs tracking-widest rounded-xl px-8 h-12 flex items-center gap-2"
                                                >
                                                    Sign Out of Axiom AI
                                                    <LogOut className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {showSuccess && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-2 text-primary"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">DNA Updated Successfully</span>
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button 
                                                variant="ghost" 
                                                className="text-muted-foreground hover:text-foreground uppercase font-bold text-[10px] tracking-widest"
                                                onClick={() => window.location.reload()}
                                            >
                                                Reset
                                            </Button>
                                            <Button 
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-xl transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {isSaving ? "Syncing..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Settings;
