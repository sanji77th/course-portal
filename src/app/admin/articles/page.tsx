"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
    FileText,
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    X,
    Image as ImageIcon,
    Save,
    Clock,
    ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [slug, setSlug] = useState("");

    const supabase = createClient();

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("articles")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setArticles(data);
        setLoading(false);
    };

    const handleOpenModal = (article: any = null) => {
        if (article) {
            setCurrentArticle(article);
            setTitle(article.title_si);
            setContent(article.content_si);
            setImageUrl(article.image_url || "");
            setSlug(article.slug);
        } else {
            setCurrentArticle(null);
            setTitle("");
            setContent("");
            setImageUrl("");
            setSlug("");
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const articleData = {
            title_si: title,
            content_si: content,
            image_url: imageUrl,
            slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        };

        if (currentArticle) {
            const { error } = await supabase
                .from("articles")
                .update(articleData)
                .eq("id", currentArticle.id);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase
                .from("articles")
                .insert([articleData]);
            if (error) alert(error.message);
        }

        setSaving(false);
        setShowModal(false);
        fetchArticles();
    };

    const handleDelete = async (id: string) => {
        if (confirm("මෙම ලිපිය මකා දැමීමට ඔබට විශ්වාසද?")) {
            const { error } = await supabase.from("articles").delete().eq("id", id);
            if (!error) fetchArticles();
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black font-outfit mb-2">Articles CMS</h1>
                    <p className="text-gray-400">Manage all blog posts and announcements.</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Create New Article
                </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-indigo-400 mx-auto" size={40} /></div>
                ) : articles.map((article) => (
                    <div key={article.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 relative group transition-all">
                        <div className="aspect-video rounded-2xl bg-gray-800 overflow-hidden mb-6">
                            {article.image_url ? (
                                <img src={article.image_url} alt={article.title_si} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5"><FileText className="text-gray-700" size={32} /></div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold font-outfit text-white mb-2 line-clamp-2">{article.title_si}</h3>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Clock size={12} /> {new Date(article.created_at).toLocaleDateString()}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenModal(article)}
                                className="flex-1 py-3 rounded-xl glass border-white/10 text-white text-xs font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                            >
                                <Edit size={14} /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(article.id)}
                                className="w-12 h-12 rounded-xl glass border-white/10 text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center shrink-0"
                            >
                                <Trash2 size={16} />
                            </button>
                            <Link
                                href={`/articles/${article.slug}`}
                                target="_blank"
                                className="w-12 h-12 rounded-xl glass border-white/10 text-indigo-400 hover:bg-indigo-400/10 transition-all flex items-center justify-center shrink-0"
                            >
                                <ExternalLink size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl max-h-[90vh] glass rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-y-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-8 right-8 p-3 rounded-full glass border-white/10 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black font-outfit text-white mb-8">{currentArticle ? "Edit Article" : "New Article"}</h2>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Sinhala Title</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            placeholder="ලිපියේ මාතෘකාව"
                                            className="w-full px-5 py-4 rounded-2xl glass border border-white/10 text-white outline-none focus:border-indigo-500 transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Slug (URL Name)</label>
                                        <input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="how-to-learn-llm"
                                            className="w-full px-5 py-4 rounded-2xl glass border border-white/10 text-white outline-none focus:border-indigo-500 transition-all text-sm font-mono"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Thumbnail URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="https://image-url.com/abc.jpg"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-white/10 text-white outline-none focus:border-indigo-500 transition-all text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Article Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        placeholder="ඔබේ ලිපියේ අන්තර්ගතය මෙතැන ඇතුළත් කරන්න..."
                                        rows={10}
                                        className="w-full px-5 py-4 rounded-3xl glass border border-white/10 text-white outline-none focus:border-indigo-500 transition-all text-lg leading-relaxed resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 rounded-2xl glass border-white/10 text-gray-400 font-bold hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-12 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Save Article
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
