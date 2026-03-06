"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
    Users,
    FileText,
    Video,
    Key,
    ShieldAlert,
    Loader2,
    ArrowUpRight,
    Activity,
    ShieldCheck,
    Smartphone
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        articles: 0,
        videoCourses: 0,
        activeCodes: 0,
        enrollments: 0
    });
    const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        const [
            { count: usersCount },
            { count: articlesCount },
            { count: videoCount },
            { count: codesCount },
            { count: enrollCount, data: enrollData }
        ] = await Promise.all([
            supabase.from("profiles").select("*", { count: 'exact', head: true }),
            supabase.from("articles").select("*", { count: 'exact', head: true }),
            supabase.from("video_courses").select("*", { count: 'exact', head: true }),
            supabase.from("access_codes").select("*", { count: 'exact', head: true }).eq('is_activated', true),
            supabase.from("enrollment_requests").select("*, profiles(email), video_courses(title_si)", { count: 'exact' }).order('created_at', { ascending: false }).limit(5)
        ]);

        setStats({
            users: usersCount || 0,
            articles: articlesCount || 0,
            videoCourses: videoCount || 0,
            activeCodes: codesCount || 0,
            enrollments: enrollCount || 0
        });
        setRecentEnrollments(enrollData || []);
        setLoading(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-400" size={40} />
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black font-outfit text-white mb-2 leading-tight tracking-tight">Platform Overview</h1>
                    <p className="text-gray-400 font-medium">පද්ධතියේ වත්මන් තත්ත්වය සහ ක්‍රියාකාරිත්වය මෙතැනින් බලන්න.</p>
                </div>
                <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl border-white/5 bg-emerald-500/5 shadow-2xl shadow-emerald-500/5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-gray-300">System Online</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Students", value: stats.users, icon: Users, color: "indigo" },
                    { label: "Active Articles", value: stats.articles, icon: FileText, color: "emerald" },
                    { label: "Video Courses", value: stats.videoCourses, icon: Video, color: "violet" },
                    { label: "Active Subscriptions", value: stats.activeCodes, icon: Key, color: "amber" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-10 rounded-[3rem] border border-white/5 relative group hover:border-white/10 transition-all hover:bg-white/[0.02]">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                            <stat.icon className={`text-${stat.color}-400`} size={28} />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            <p className="text-5xl font-black font-outfit text-white leading-none">{stat.value}</p>
                            <span className="text-[11px] font-black text-emerald-500 flex items-center mb-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={12} className="mr-1" /> LIVE
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Enrollments */}
                <div className="lg:col-span-2 glass-card p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black font-outfit text-white flex items-center gap-4">
                            <Activity className="text-indigo-400" size={28} />
                            New Enrollments
                        </h3>
                        <Link href="/admin/users" className="text-xs font-bold text-gray-500 hover:text-white transition-colors underline underline-offset-4 tracking-widest uppercase">View All Users</Link>
                    </div>

                    <div className="space-y-6">
                        {recentEnrollments.length === 0 ? (
                            <div className="p-10 text-center glass rounded-3xl border-dashed border-white/5 opacity-50">සක්‍රිය ඉල්ලීම් නොමැත</div>
                        ) : recentEnrollments.map((req) => (
                            <div key={req.id} className="p-6 rounded-[2rem] glass border border-white/5 flex items-center justify-between gap-6 hover:bg-white/5 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black font-outfit text-xl">
                                        {req.profiles?.email?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg leading-none mb-2">{req.profiles?.email}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                            {req.video_courses?.title_si}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs flex items-center gap-2 group-hover:bg-white group-hover:text-black transition-all">
                                        <Smartphone size={14} /> {req.phone}
                                    </div>
                                    <Link href="/admin/codes" className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                        <Key size={20} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Quick View */}
                <div className="glass-card p-10 rounded-[3.5rem] border-red-500/10 bg-red-400/[0.02] shadow-2xl flex flex-col">
                    <h3 className="text-2xl font-black font-outfit text-white mb-8 flex items-center gap-3 text-red-400">
                        <ShieldAlert size={28} />
                        Security Alerts
                    </h3>
                    <div className="flex-1 space-y-6">
                        <div className="p-8 rounded-[2.5rem] glass border-red-500/20 text-center space-y-6 bg-gradient-to-br from-red-500/10 to-transparent">
                            <div className="w-16 h-16 rounded-3xl bg-red-500/20 flex items-center justify-center mx-auto text-red-500 border border-red-500/30">
                                <ShieldCheck size={32} />
                            </div>
                            <h4 className="text-xl font-bold font-outfit text-white">Advanced Monitoring</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">System is tracking continuous logins and unique IP addresses to protect content from sharing.</p>
                            <Link href="/admin/users" className="block w-full py-4 rounded-2xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-all">
                                View Security Log
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
