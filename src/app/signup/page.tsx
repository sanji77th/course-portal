"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, User, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            // Manually sync profile data if trigger isn't set up
            if (authData.user) {
                const { error: profileError } = await supabase.from("profiles").upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    updated_at: new Date().toISOString()
                });

                if (profileError) {
                    console.error("DEBUG - Profile Sync Error:", profileError.message, profileError.code);

                    // If permissions error, it's normal if confirmation is required
                    if (profileError.code === '42501') {
                        console.warn("Manual sync blocked by RLS policies (User not signed in yet). The trigger should handle it in the background.");
                    } else {
                        setError("ගිණුම සෑදූ නමුත් දත්ත සමමුහුර්ත කිරීම අසාර්ථක විය: " + profileError.message);
                        setLoading(false);
                        return;
                    }
                }
            }
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 blur-[150px] rounded-full -z-10" />
                <div className="w-full max-w-md glass p-10 rounded-[2.5rem] text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-3xl bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                        <CheckCircle2 className="text-green-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-white">Registration සාර්ථකයි!</h2>
                    <p className="text-gray-400 leading-relaxed">අපි ඔයාගේ email ලිපිනයට තහවුරු කිරීමේ (Verification) පණිවිඩයක් එවලා තියෙන්නේ. කරුණාකර එය පරීක්ෂා කර බලන්න.</p>
                    <Link href="/login" className="block w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/10">
                        Home Page එකට යන්න
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 blur-[150px] rounded-full -z-10" />

            <div className="w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl relative">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                        <User className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black font-outfit text-white mb-2">Register වෙන්න</h1>
                    <p className="text-gray-400">අදම Register වෙලා ඔයාගේ Learning Journey එක Start කරන්න.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">සම්පූර්ණ නම</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-white transition-all focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="සම්පූර්ණ නම ඇතුළත් කරන්න"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email ලිපිනය</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-white transition-all focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password මුරපදය</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-white transition-all focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Register වන්න"}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400">
                    දැනටමත් Account එකක් තිබේද?{" "}
                    <Link href="/login" className="text-indigo-400 font-bold hover:underline">
                        Sign In වෙන්න මෙතන ඔබන්න
                    </Link>
                </p>
            </div>
        </div>
    );
}
