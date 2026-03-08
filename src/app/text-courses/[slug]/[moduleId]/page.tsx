import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { BookOpen, ArrowLeft, ArrowRight, Share2, Clipboard } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ModuleContentPage({ params }: { params: Promise<{ slug: string, moduleId: string }> }) {
    const supabase = await createClient();
    const { slug, moduleId } = await params;

    // 1. Fetch Module details
    const { data: module, error: moduleError } = await supabase
        .from("text_modules")
        .select("*, text_courses(*)")
        .eq("id", moduleId)
        .single();

    if (moduleError || !module) return notFound();

    // 2. Fetch all modules for sidebar/next-prev
    const { data: siblingModules, error: siblingsError } = await supabase
        .from("text_modules")
        .select("id, title_si, order_index")
        .eq("course_id", module.course_id)
        .order("order_index", { ascending: true });

    const currentIndex = siblingModules?.findIndex((m) => m.id === moduleId) ?? -1;
    const prevModule = currentIndex > 0 ? siblingModules?.[currentIndex - 1] : null;
    const nextModule = currentIndex < (siblingModules?.length ?? 0) - 1 ? siblingModules?.[currentIndex + 1] : null;

    return (
        <div className="min-h-screen flex flex-col pt-24">
            <Navbar />

            <main className="flex-1 px-6 pb-20">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <Link href={`/text-courses/${slug}`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold mb-4 group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                මොඩියුල ලැයිස්තුවට (Modules List)
                            </Link>
                            <div className="flex items-center justify-between mb-4">
                                <div className="px-3 py-1 rounded-full glass border-white/5 bg-white/5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Text Course - {module.text_courses?.title_si}
                                </div>
                                <div className="flex items-center gap-4 text-gray-400">
                                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors"><Share2 size={18} /></button>
                                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors"><Clipboard size={18} /></button>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black font-outfit text-white mb-4 leading-tight">
                                {module.title_si}
                            </h1>
                            <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 mb-6" />
                        </div>

                        {/* Content */}
                        <div className="glass-card px-4 pb-6 pt-0 md:px-10 md:pb-10 md:pt-0 rounded-[3rem] shadow-2xl overflow-hidden leading-relaxed">
                            <div
                                className="text-gray-300 text-lg md:text-xl prose prose-invert prose-indigo max-w-none [&>*:first-child]:mt-0"
                                dangerouslySetInnerHTML={{ __html: module.content_si.trim().replace(/\n/g, '<br/>') }}
                            />
                        </div>

                        {/* Navigation (Next / Prev) */}
                        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
                            {prevModule ? (
                                <Link
                                    href={`/text-courses/${slug}/${prevModule.id}`}
                                    className="w-full sm:w-auto p-6 rounded-3xl glass hover:border-indigo-500/30 transition-all flex items-center gap-4 group"
                                >
                                    <ArrowLeft className="text-indigo-500 group-hover:-translate-x-1 transition-transform" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">පෙර පාඩම</p>
                                        <p className="font-bold text-white text-lg">{prevModule.title_si}</p>
                                    </div>
                                </Link>
                            ) : <div />}

                            {nextModule ? (
                                <Link
                                    href={`/text-courses/${slug}/${nextModule.id}`}
                                    className="w-full sm:w-auto p-6 rounded-3xl glass hover:border-indigo-500/30 transition-all flex items-center gap-4 text-right group ml-auto"
                                >
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">මීළඟ පාඩම</p>
                                        <p className="font-bold text-white text-lg">{nextModule.title_si}</p>
                                    </div>
                                    <ArrowRight className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : <div />}
                        </div>
                    </div>

                    {/* Sidebar Modules Nav */}
                    <aside className="w-full lg:w-80 space-y-8 sticky top-32 h-fit">
                        <div className="glass-card p-6 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-bold font-outfit text-white mb-6 flex items-center gap-3">
                                <BookOpen className="text-indigo-400" size={20} />
                                පාඨමාලාවේ පටුන
                            </h3>
                            <div className="space-y-2">
                                {siblingModules?.map((sib, i) => (
                                    <Link
                                        key={sib.id}
                                        href={`/text-courses/${slug}/${sib.id}`}
                                        className={`flex items-center gap-4 p-4 rounded-xl text-sm font-medium transition-all ${sib.id === moduleId ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                                    >
                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${sib.id === moduleId ? "bg-white/20" : "bg-gray-800"}`}>
                                            {i + 1}
                                        </span>
                                        <span className="line-clamp-1 flex-1">{sib.title_si}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Progress Box Placeholder */}
                        <div className="p-6 rounded-3xl glass-card text-center bg-indigo-600/10 border-indigo-500/20">
                            <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">ඔබේ ප්‍රගතිය</p>
                            <div className="w-full h-3 rounded-full bg-gray-800 mb-4 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                                    style={{ width: `${((currentIndex + 1) / (siblingModules?.length ?? 1)) * 100}%` }}
                                />
                            </div>
                            <p className="text-gray-400 text-xs">{currentIndex + 1} of {siblingModules?.length} modules completed</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
