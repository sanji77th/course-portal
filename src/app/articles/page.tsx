import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { FileText, ArrowRight, Share2, Sparkles, TrendingUp } from "lucide-react";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
    const supabase = await createClient();

    const { data: articles, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen flex flex-col pt-32 pb-20 px-6">
            <Navbar />

            <main className="max-w-7xl mx-auto flex-1 w-full">
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-4 uppercase tracking-widest">
                        <FileText size={14} />
                        Articles and Updates
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black font-outfit text-white mb-6 animate-in slide-in-from-left duration-700">Explore Articles</h1>
                    <p className="text-gray-400 max-w-2xl text-lg md:text-xl leading-relaxed">
                        Technology, Education පිළිබඳ Articles සහ Updates.
                    </p>
                </div>

                {!articles || articles.length === 0 ? (
                    <div className="glass p-20 rounded-[3rem] text-center border-white/5 border-dashed">
                        <FileText className="text-gray-800 mx-auto mb-6 shrink-0" size={64} />
                        <h3 className="text-xl font-bold text-gray-500">ලිපි තවමත් පළ කර නොමැත</h3>
                        <p className="text-gray-600 mt-2">නව ලිපි ඉක්මනින් එකතු කරනු ඇත.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.slug}`}
                                className="group relative glass-card p-6 rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 active:scale-95"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[16/9] rounded-2xl bg-gray-800 overflow-hidden relative mb-6">
                                    {article.image_url ? (
                                        <img
                                            src={article.image_url}
                                            alt={article.title_si}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-black">
                                            <FileText className="text-emerald-400 opacity-20" size={48} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">නවතම</span>
                                        <span className="text-xs text-gray-500 font-medium">{new Date(article.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold font-outfit text-white mb-3 line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">
                                        {article.title_si}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-8 leading-relaxed">
                                        {article.content_si.substring(0, 150)}...
                                    </p>

                                    <div className="mt-auto flex items-center justify-between text-emerald-400 font-bold text-sm tracking-wide">
                                        කියවන්න <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
