import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { FileText, ArrowLeft, ArrowRight, Share2, Clipboard, ShieldCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ArticleContentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch Article details
    const { data: article, error: articleError } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .single();

    if (articleError || !article) return notFound();

    return (
        <div className="min-h-screen flex flex-col pt-32 bg-black">
            <Navbar />

            <main className="flex-1 px-6 pb-20">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    {/* Back link */}
                    <Link href="/articles" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold mb-10 group mr-auto">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        සියලුම ලිපි (All Articles)
                    </Link>

                    {/* Header */}
                    <div className="mb-16 w-full text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 uppercase tracking-widest">
                            <Sparkles size={14} />
                            ලිපි සහ පුවත්
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black font-outfit text-white mb-8 leading-tight animate-in slide-in-from-bottom duration-700">
                            {article.title_si}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-gray-500 text-sm font-medium mb-12">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                                {new Date(article.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 rounded-full hover:bg-white/5 transition-colors border border-white/10"><Share2 size={18} /></button>
                                <button className="p-3 rounded-full hover:bg-white/5 transition-colors border border-white/10"><Clipboard size={18} /></button>
                            </div>
                        </div>

                        {/* Main Image */}
                        {article.image_url && (
                            <div className="aspect-[16/6] w-full rounded-[3rem] overflow-hidden glass shadow-2xl border border-white/10 relative shadow-emerald-500/10 mb-16 group">
                                <img
                                    src={article.image_url}
                                    alt={article.title_si}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="w-full prose prose-invert prose-emerald max-w-none shadow-2xl overflow-hidden leading-relaxed animate-in fade-in duration-1000 delay-300">
                        <div className="glass-card p-10 md:p-20 rounded-[4rem] border border-white/5 space-y-8 bg-gradient-to-br from-emerald-950/20 to-transparent">
                            <div
                                className="text-gray-300 text-xl md:text-2xl font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: article.content_si.replace(/\n/g, '<br/>') }}
                            />
                        </div>
                    </div>

                    {/* Bottom Card */}
                    <div className="mt-20 w-full p-12 glass rounded-[3rem] border border-white/5 text-center space-y-6 bg-gradient-to-br from-white/5 via-transparent to-transparent">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-bold font-outfit text-white">වැදගත්</h3>
                        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">මෙම ලිපියේ අඩංගු කරුණු ඔබේ අධ්‍යාපනික කටයුතු සඳහා පමණක් භාවිතා කරන්න.</p>
                        <Link href="/text-courses" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-emerald-600/25">
                            පාඨමාලා බලන්න <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
