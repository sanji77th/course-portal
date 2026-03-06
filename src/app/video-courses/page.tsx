import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Video, ArrowRight, Play, Flame, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VideoCoursesPage() {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
        .from("video_courses")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen flex flex-col pt-32 px-6 pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto flex-1">
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-4 uppercase tracking-widest">
                        <Video size={14} />
                        වීඩියෝ පාඨමාලා
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black font-outfit text-white mb-6 animate-in slide-in-from-left duration-700">Video Masterclasses</h1>
                    <p className="text-gray-400 max-w-2xl text-lg md:text-xl leading-relaxed">
                        ප්‍රායෝගිකව ඉගෙන ගැනීමට අවශ්‍ය සියලුම වීඩියෝ පාඨමාලා සහ තාක්ෂණික උපදෙස් මෙතැනින් ලබාගන්න.
                    </p>
                </div>

                {!courses || courses.length === 0 ? (
                    <div className="glass p-20 rounded-[3.5rem] text-center border-white/5 border-dashed">
                        <Play className="text-gray-800 mx-auto mb-6 shrink-0" size={64} />
                        <h3 className="text-xl font-bold text-gray-500">වීඩියෝ පාඨමාලා නොමැත</h3>
                        <p className="text-gray-600 mt-2">නව පාඨමාලා ඉක්මනින් එකතු කරනු ඇත.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="group relative glass-card p-4 rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                                {/* Thumbnail */}
                                <div className="aspect-[16/10] rounded-3xl bg-gray-800 overflow-hidden relative mb-6">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title_si}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-black">
                                            <Play className="text-indigo-400 opacity-20 group-hover:opacity-100 transition-opacity" size={64} fill="currentColor" />
                                        </div>
                                    )}

                                    {/* Premium Badge */}
                                    {course.is_premium && (
                                        <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full glass border-indigo-500/30 bg-indigo-600/20 text-indigo-400 text-xs font-bold flex items-center gap-2 backdrop-blur-xl animate-pulse">
                                            <ShieldCheck size={14} />
                                            PREMIUM
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full glass border-white/10 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <Play className="text-white fill-white ml-1" size={32} />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 flex flex-col flex-1">
                                    <h3 className="text-2xl font-bold font-outfit text-white mb-2 line-clamp-2 leading-tight">
                                        {course.title_si}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-8 leading-relaxed">
                                        {course.description_si}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030712] bg-gray-800 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.id + i}`} alt="Student" />
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-[#030712] bg-[#030712] text-xs font-bold text-gray-500 flex items-center justify-center">+</div>
                                        </div>

                                        <Link
                                            href={`/video-courses/${course.slug}`}
                                            className="px-8 py-3 rounded-2xl bg-white text-black font-bold text-sm hover:translate-x-1 transition-transform flex items-center gap-2 hover:bg-indigo-400 hover:text-white"
                                        >
                                            Explore <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
