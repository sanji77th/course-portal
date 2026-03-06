"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { User, Mail, Smartphone, ShieldCheck, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setEmail(user.email || "");

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (data) {
            setProfile(data);
            setFullName(data.full_name || "");
            setPhone(data.phone || "");
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: fullName,
                phone: phone,
                updated_at: new Date().toISOString()
            })
            .eq("id", user.id);

        if (error) {
            setMessage({ type: 'error', text: "දත්ත සුරැකීමේදී ගැටලුවක් ඇති විය: " + error.message });
        } else {
            setMessage({ type: 'success', text: "ඔබේ තොරතුරු සාර්ථකව සුරැකින ලදී." });
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="text-indigo-400 animate-spin" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <Navbar />

            <div className="max-w-3xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-10 font-bold group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> ආපසු යන්න
                </Link>

                <div className="glass-card p-10 md:p-14 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                    <div className="relative">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                <User size={40} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black font-outfit text-white">ගිණුම් තොරතුරු</h1>
                                <p className="text-gray-500 font-medium tracking-tight">ඔබේ පෞද්ගලික තොරතුරු මෙතැනින් යාවත්කාලීන කරන්න.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">සම්පූර්ණ නම</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="ඔබේ නම"
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email ලිපිනය</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                        <input
                                            value={email}
                                            disabled
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 outline-none cursor-not-allowed font-medium"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-bold pl-1 uppercase tracking-tighter">* Email ලිපිනය වෙනස් කළ නොහැක</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">දුරකථන අංකය</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="07x xxxxxxx"
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">ගිණුම් තත්ත්වය</label>
                                    <div className="h-[60px] px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400">
                                        <ShieldCheck size={20} />
                                        <span className="font-black text-sm uppercase tracking-widest">Active Member</span>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2`}>
                                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto px-12 py-5 rounded-2xl bg-white text-black font-black text-lg hover:bg-indigo-400 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/10 flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} තොරතුරු සුරකින්න
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
