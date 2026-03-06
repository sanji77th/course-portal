import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { BookOpen, ArrowRight, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TextCoursesPage() {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
        .from("text_courses")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-4">
                            <Layers size={14} />
                            පෙළ පාඨමාලා
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-outfit text-white mb-6">Course Collections</h1>
                        <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                            ඔබේ වේගයෙන් කියවා තේරුම් ගත හැකි පරිදි සකස් කරන ලද උසස් පෙළ පාඨමාලා මාලාව.
                        </p>
                    </div>

                    {!courses || courses.length === 0 ? (
                        <div className="glass p-20 rounded-[3rem] text-center border-white/5 border-dashed">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="text-gray-600" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-500">පවතින පාඨමාලා නොමැත</h3>
                            <p className="text-gray-600 mt-2">කරුණාකර පසුව නැවත පරීක්ෂා කරන්න.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course) => (
                                <div key={course.id} className="group relative glass-card p-6 overflow-hidden flex flex-col">
                                    {/* Thumbnail Placeholder/Image */}
                                    <div className="aspect-video rounded-2xl bg-gray-800 mb-6 overflow-hidden relative">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title_si}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                                <BookOpen className="text-gray-700" size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <h3 className="text-2xl font-bold font-outfit text-white mb-3 leading-snug">
                                        {course.title_si}
                                    </h3>

                                    <p className="text-gray-400 text-sm line-clamp-2 mb-8 leading-relaxed">
                                        {course.description_si}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">පෙළ පාඨමාලාව</span>
                                        <Link
                                            href={`/text-courses/${course.slug}`}
                                            className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-indigo-400 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            Explore <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
