import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { BookOpen, List, ChevronRight, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CourseModulesPage({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient();
    const { slug } = await params;

    // 1. Fetch Course details
    const { data: course, error: courseError } = await supabase
        .from("text_courses")
        .select("*")
        .eq("slug", slug)
        .single();

    if (courseError || !course) return notFound();

    // 2. Fetch Modules for this course
    const { data: modules, error: modulesError } = await supabase
        .from("text_modules")
        .select("*")
        .eq("course_id", course.id)
        .order("order_index", { ascending: true });

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back links */}
                    <Link href="/text-courses" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold mb-10 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        සියලුම පාඨමාලා
                    </Link>

                    {/* Header */}
                    <div className="mb-16 glass-card p-10 rounded-[3rem] border-white/10">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-48 h-48 rounded-3xl bg-gray-800 overflow-hidden shrink-0 shadow-2xl">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title_si} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-500/20">
                                        <BookOpen size={64} className="text-indigo-500" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-4xl md:text-5xl font-black font-outfit text-white mb-4 leading-tight">{course.title_si}</h1>
                                <p className="text-gray-400 text-lg leading-relaxed">{course.description_si}</p>
                                <div className="mt-8 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                                    <div className="px-4 py-2 rounded-xl glass bg-white/5 border-white/10 text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <List size={14} />
                                        {modules?.length || 0} Modules
                                    </div>
                                    <div className="px-4 py-2 rounded-xl glass bg-white/5 border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        High Level Content
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black font-outfit text-white flex items-center gap-4 mb-8">
                            <div className="w-10 h-1 h-px bg-indigo-500" />
                            පාඨමාලා මොඩියුල (Modules)
                        </h2>

                        {!modules || modules.length === 0 ? (
                            <div className="glass p-16 rounded-[2rem] text-center border-dashed border-white/5">
                                <p className="text-gray-600 font-bold">තවමත් මෙම පාඨමාලාවට මොඩියුල එකතු කර නොමැත.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {modules.map((module, idx) => (
                                    <Link
                                        key={module.id}
                                        href={`/text-courses/${slug}/${module.id}`}
                                        className="group flex items-center gap-6 p-6 rounded-3xl glass shadow-xl border border-white/5 hover:border-indigo-500/30 transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-black font-outfit text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-indigo-500/20">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold font-outfit text-white mb-1">{module.title_si}</h4>
                                            <p className="text-gray-500 text-sm">මාතෘකාව බලන්න</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full glass border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                            <ChevronRight size={20} />
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
