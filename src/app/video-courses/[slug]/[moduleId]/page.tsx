"use client";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    Play,
    Video,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Loader2,
    Search,
    BookOpen,
    Info
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function VideoPlayerPage({ params: paramsPromise }: { params: Promise<{ slug: string, moduleId: string }> }) {
    const params = use(paramsPromise);
    const { slug, moduleId } = params;
    const [course, setCourse] = useState<any>(null);
    const [currentModule, setCurrentModule] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // 1. Get Course & Current Module
        const { data: courseData } = await supabase
            .from("video_courses")
            .select("*")
            .eq("slug", slug)
            .single();

        const { data: moduleData } = await supabase
            .from("video_modules")
            .select("*")
            .eq("id", moduleId)
            .single();

        if (!courseData || !moduleData) {
            router.push("/video-courses");
            return;
        }
        setCourse(courseData);
        setCurrentModule(moduleData);

        // 2. Check Access
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        if (!courseData.is_premium) {
            setHasAccess(true);
        } else {
            const { data: codeData } = await supabase
                .from("access_codes")
                .select("*")
                .eq("course_id", courseData.id)
                .eq("user_id", user.id)
                .eq("is_activated", true)
                .single();

            if (codeData) setHasAccess(true);
            else {
                router.push(`/video-courses/${slug}`);
                return;
            }
        }

        // 3. Get All Modules for Sidebar
        const { data: siblingModules } = await supabase
            .from("video_modules")
            .select("*")
            .eq("course_id", courseData.id)
            .order("order_index", { ascending: true });

        setModules(siblingModules || []);
        setLoading(false);
    };

    const getEmbedUrl = (url: string) => {
        try {
            if (url.includes('youtube.com/embed/')) return url;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="text-white animate-spin" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col pt-32 px-6 pb-20 bg-black">
            <Navbar />

            <main className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12">
                {/* Player Area */}
                <div className="flex-1 space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                        <div>
                            <Link href={`/video-courses/${slug}`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold mb-2 group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                පාඨමාලා විස්තරය (Course Detail)
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-black font-outfit text-white leading-tight">
                                {currentModule.title_si}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass bg-white/5 border-white/5 text-gray-400 text-xs font-bold uppercase">
                                <Play size={14} className="text-indigo-500" />
                                Lesson {modules.findIndex(m => m.id === moduleId) + 1} of {modules.length}
                            </div>
                        </div>
                    </div>

                    {/* Video Player */}
                    <div className="aspect-video glass-card rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_-30px_rgba(79,70,229,0.3)] border border-white/10 group">
                        <iframe
                            className="w-full h-full"
                            src={getEmbedUrl(currentModule.youtube_url)}
                            title={currentModule.title_si}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>

                    {/* Description Card */}
                    <div className="glass-card p-10 rounded-[3rem] space-y-8 border border-white/5">
                        <div className="flex items-center gap-3 text-indigo-400">
                            <Info size={24} />
                            <h3 className="text-xl font-bold font-outfit text-white">වැදගත් විස්තර (Lesson Description)</h3>
                        </div>
                        <div
                            className="text-gray-400 text-lg leading-relaxed space-y-4"
                            dangerouslySetInnerHTML={{ __html: currentModule.description_si.replace(/\n/g, '<br/>') }}
                        />
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-96 space-y-8 sticky top-32 h-fit">
                    <div className="glass-card p-8 rounded-[3rem] shadow-2xl border border-white/5">
                        <h3 className="text-xl font-bold font-outfit text-white mb-6 flex items-center gap-3">
                            <Video className="text-indigo-400" size={24} />
                            පාඩම් මාලාව (Playlist)
                        </h3>
                        <div className="space-y-3">
                            {modules.map((m, idx) => (
                                <Link
                                    key={m.id}
                                    href={`/video-courses/${slug}/${m.id}`}
                                    className={`flex items-start gap-4 p-5 rounded-2xl transition-all border ${m.id === moduleId ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20 text-white" : "glass border-white/5 text-gray-400 hover:border-white/20 hover:text-white"}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${m.id === moduleId ? "bg-white/20" : "bg-gray-800"}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className={`font-bold mb-1 line-clamp-1 ${m.id === moduleId ? "text-white" : "text-gray-200"}`}>
                                            {m.title_si}
                                        </p>
                                        <p className="text-xs text-inherit opacity-60 flex items-center gap-1">
                                            <Play size={10} /> වීඩියෝව බලන්න
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Support/Help Card */}
                    <div className="p-8 rounded-[3rem] glass-card text-center bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 text-indigo-400">
                            <Search size={32} />
                        </div>
                        <h4 className="text-white font-bold mb-2">ප්‍රශ්නයක් තිබේද?</h4>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">මෙම පාඩම පිළිබඳව ඔබට කිසියම් ගැටලුවක් ඇත්නම් අපව සම්බන්ධ කරගන්න.</p>
                        <button className="w-full py-4 rounded-2xl glass border-white/10 text-white font-bold text-sm hover:bg-white hover:text-black transition-all">
                            අපට පණිවිඩයක් එවන්න
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}
