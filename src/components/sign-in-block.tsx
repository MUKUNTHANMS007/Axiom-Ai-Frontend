import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/checkbox";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordField from "./password-field";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { User, ArrowRight } from "lucide-react";

interface SignInFormData {
  username: string;
  password: string;
  rememberMe: boolean;
  firstName?: string;
  lastName?: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  rememberMe?: string;
  general?: string;
}

interface SignInBlockProps {
  initialMode?: "signin" | "signup";
  inviteToken?: string | null;
}

const SignInBlock = ({ initialMode = "signin", inviteToken }: SignInBlockProps) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [formData, setFormData] = useState<SignInFormData>({
    username: "",
    password: "",
    rememberMe: false,
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (mode === "signup" && formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
    }

    if (mode === "signup" && !formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
    }

    if (mode === "signup" && !formData.lastName?.trim()) {
        newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof SignInFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "signin") {
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('User Name', formData.username)
          .eq('Password', formData.password)
          .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error("Invalid username or access key.");
            }
            throw error;
        }

        if (data) {
            // Manual Session Management
            const userSession = {
                user: {
                    id: data['User Id'],
                    name: data['User Name'],
                },
                expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
            };
            localStorage.setItem("vibe_session", JSON.stringify(userSession));
            // Trigger a storage event to notify App.tsx
            window.dispatchEvent(new Event("storage"));
        }
      } else {
        // 1. Check if username protocol already exists
        const { data: existingUser } = await supabase
          .from('User')
          .select('User Name')
          .eq('User Name', formData.username)
          .single();

        if (existingUser) {
            throw new Error("This username protocol is already registered.");
        }

        // 2. Clear to initialize
        const { error } = await supabase
          .from('User')
          .insert({
            'User Id': Math.floor(Math.random() * 1000000), // Random numeric ID
            'User Name': formData.username,
            'Password': formData.password,
          });
        
        if (error) {
            if (error.code === '23505') throw new Error("ID Collision or Name taken. Please try again.");
            throw error;
        }
        
        setMode("signin");
        setErrors({ general: "Account created successfully. Please authenticate." });
        return;
      }

      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      if (inviteToken) {
        navigate(`/invite/${inviteToken}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrors({ general: err.message || `Failed to ${mode === "signin" ? "sign in" : "sign up"}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative">
                {/* Decorative glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <CardHeader className="space-y-1 pb-6 px-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#050505] flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl group shadow-primary/20">
                            <img src="/axiom-logo.png" alt="Axiom logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-headline font-black text-center text-white tracking-tighter mb-4 uppercase">
                        Welcome to Axiom AI
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-center font-body mb-8 max-w-sm mx-auto">
                        Join the elite engineering network synthesizing future-ready architectures.
                    </CardDescription>
                    <CardDescription className="text-center text-slate-400 text-sm">
                        {mode === "signin" 
                            ? "Enter your credentials to access the OS" 
                            : "Join the next generation of architects"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg"
                            >
                                {errors.general}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {mode === "signup" && (
                                <motion.div
                                    key="signup-name"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="firstName"
                                                placeholder="Alan"
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                                className="bg-white/5 border-white/5 pl-10 h-11 focus:border-primary/50 transition-all text-white"
                                            />
                                        </div>
                                        {errors.firstName && <p className="text-[10px] text-red-400 ml-1">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Turing"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            className="bg-white/5 border-white/5 h-11 focus:border-primary/50 transition-all text-white"
                                        />
                                        {errors.lastName && <p className="text-[10px] text-red-400 ml-1">{errors.lastName}</p>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Username Protocol</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your handle..."
                                    value={formData.username}
                                    onChange={(e) => handleInputChange("username", e.target.value)}
                                    className="bg-white/5 border-white/5 pl-10 h-11 focus:border-primary/50 transition-all text-white"
                                />
                            </div>
                            {errors.username && <p className="text-[10px] text-red-400 ml-1">{errors.username}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password-field" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Access Key</Label>
                            <PasswordField
                                label=""
                                placeholder="••••••••"
                                className="w-full bg-white/5 border-white/10"
                                showChecklist={mode === "signup"}
                                allowGenerate={mode === "signup"}
                                onChange={(val: string) => handleInputChange("password", val)}
                            />
                            {errors.password && <p className="text-[10px] text-red-400 ml-1">{errors.password}</p>}
                        </div>

                        {mode === "signin" && (
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="rememberMe"
                                        checked={formData.rememberMe}
                                        onCheckedChange={(checked) => handleInputChange("rememberMe", checked === true)}
                                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <Label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer">
                                        Persistent Session
                                    </Label>
                                </div>
                                <button type="button" className="text-xs text-primary/70 hover:text-primary transition-colors font-medium">
                                    Reset Keys?
                                </button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-black hover:bg-primary hover:text-white font-bold transition-all rounded-xl mt-4 relative group overflow-hidden"
                            disabled={isLoading}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>
                                        {mode === "signin" ? "Authenticate" : "Initialize Engine"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="px-8 pb-8 pt-2 flex justify-center border-t border-white/5 mt-4">
                    <p className="text-xs text-slate-500">
                        {mode === "signin" ? "New Architect?" : "Already Authorized?"}{" "}
                        <button
                            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                            className="text-white hover:text-primary transition-colors font-bold underline underline-offset-4 ml-1"
                        >
                            {mode === "signin" ? "Register Now" : "Sign In"}
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    </div>
  );
};

export default SignInBlock;
