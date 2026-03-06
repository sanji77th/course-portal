"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 blur-[150px] rounded-full -z-10" />

            <div className="w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl relative">
                <div className="absolute top-0 right-0 p-4">
                    <Link href="/" className="text-gray-500 hover:text-white transition-colors">
                        <span className="text-sm font-medium">මඟහරින්න</span>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black font-outfit text-white mb-2">පිවිසෙන්න</h1>
                    <p className="text-gray-400">ඔබගේ ගිණුමට ඇතුළු වී ඉගෙනුම දිගටම කරගෙන යන්න.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
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
                        {loading ? <Loader2 className="animate-spin" /> : "පිවිසෙන්න"}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400">
                    ගිණුමක් නැද්ද?{" "}
                    <Link href="/signup" className="text-indigo-400 font-bold hover:underline">
                        අලුත් ගිණුමක් සාදන්න
                    </Link>
                </p>
            </div>
        </div>
    );
}
