"use client";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    User,
    BookOpen,
    Video,
    Play,
    ShieldCheck,
    Settings,
    Loader2,
    TrendingUp,
    LogOut,
    ChevronRight,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setUser(user);

        // 2. Get Profile
        const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
        setProfile(profileData);

        // 3. Get Enrolled/Activated Premium Courses
        const { data: codes } = await supabase
            .from("access_codes")
            .select("*, video_courses(*)")
            .eq("user_id", user.id)
            .eq("is_activated", true);

        setEnrolledCourses(codes?.map(c => c.video_courses) || []);
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="text-white animate-spin" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col pt-32 px-6 pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12">
                {/* Sidebar / Profile Card */}
                <aside className="w-full lg:w-80 space-y-8 h-fit lg:sticky lg:top-32">
                    <div className="glass-card p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-600" />
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
                            <User size={48} />
                        </div>
                        <h3 className="text-2xl font-black font-outfit text-white mb-2">{profile?.full_name || "User Name"}</h3>
                        <p className="text-gray-500 text-sm mb-8">{user?.email}</p>

                        <div className="flex flex-col gap-3">
                            <Link href="/profile" className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:translate-x-1 transition-transform flex items-center justify-center gap-2">
                                <Settings size={16} /> මගේ ගිණුම
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full py-3.5 rounded-2xl glass border-white/10 text-gray-400 font-bold text-sm hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={16} /> විසන්ධි වන්න
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="p-6 rounded-[2rem] glass border border-white/5 text-center space-y-2">
                            <p className="text-3xl font-black font-outfit text-indigo-400">{enrolledCourses.length}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Premium Courses</p>
                        </div>
                        <div className="p-6 rounded-[2rem] glass border border-white/5 text-center space-y-2">
                            <p className="text-3xl font-black font-outfit text-violet-400">Active</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account Status</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 space-y-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black font-outfit text-white mb-2 leading-tight">Dashboard</h1>
                            <p className="text-gray-400 font-medium">නැවතත් සාදරයෙන් පිළිගනිමු!</p>
                        </div>
                        <div className="flex items-center gap-3 glass p-4 rounded-[2rem] bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-bold text-sm animate-pulse-slow">
                            <Sparkles size={18} /> ඔබට අලුත් පාඨමාලා කිහිපයක් තිබේ
                        </div>
                    </div>

                    {/* Welcome Banner */}
                    <div className="p-10 md:p-14 rounded-[4rem] glass relative overflow-hidden group shadow-2xl border border-white/5 bg-gradient-to-br from-indigo-900/40 via-transparent to-transparent">
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={300} className="text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-black font-outfit text-white mb-6 leading-tight">ඔබව සාදරයෙන් පිළිගනිමු.</h2>
                        <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
                            ඔබගේ තෝරාගත් පාඨමාලා පහතින් දැකිය හැකි අතර, එතැන් සිට ඔබේ ඉගෙනුම් කටයුතු කරගෙන යා හැකිය.
                        </p>
                        <Link href="/video-courses" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-white/10 active:scale-95">
                            නව පාඨමාලා බලන්න <ArrowRight size={20} />
                        </Link>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-black font-outfit text-white flex items-center gap-4">
                            <div className="w-10 h-1 bg-indigo-500 rounded-full" />
                            මගේ පාඨමාලා (My Subscriptions)
                        </h3>

                        {enrolledCourses.length === 0 ? (
                            <div className="glass p-20 rounded-[3rem] text-center border-white/5 border-dashed">
                                <Video className="text-gray-800 mx-auto mb-6 shrink-0" size={64} />
                                <h3 className="text-xl font-bold text-gray-500">තවමත් කිසිදු පාඨමාලාවකට සම්බන්ධ වී නොමැත</h3>
                                <p className="text-gray-600 mt-2">නව පාඨමාලා සමඟින් ඔබේ අනාගතය අදම ආරම්භ කරන්න.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {enrolledCourses.map((course) => (
                                    <Link
                                        key={course.id}
                                        href={`/video-courses/${course.slug}`}
                                        className="group relative glass rounded-[2.5rem] p-6 flex items-center gap-6 border border-white/5 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] active:scale-[0.98]"
                                    >
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-gray-800 overflow-hidden shrink-0 shadow-lg relative group-hover:scale-105 transition-transform duration-500">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.title_si} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                                                    <Video size={32} className="text-indigo-500" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play fill="currentColor" size={24} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="text-xl font-bold font-outfit text-white mb-1 line-clamp-1">{course.title_si}</h4>
                                            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                                <ShieldCheck size={14} /> Premium Access
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full glass border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
