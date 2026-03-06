"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
    Video,
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    X,
    Image as ImageIcon,
    Save,
    Play,
    Layers,
    ShieldCheck,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function AdminVideoCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Modules State
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [modules, setModules] = useState<any[]>([]);
    const [currentModule, setCurrentModule] = useState<any>(null);
    const [moduleSaving, setModuleSaving] = useState(false);

    // Form State Course
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [slug, setSlug] = useState("");
    const [isPremium, setIsPremium] = useState(false);

    // Form State Module
    const [modTitle, setModTitle] = useState("");
    const [modDesc, setModDesc] = useState("");
    const [modUrl, setModUrl] = useState("");
    const [modOrder, setModOrder] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("video_courses")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setCourses(data);
        setLoading(false);
    };

    const fetchModules = async (courseId: string) => {
        const { data } = await supabase
            .from("video_modules")
            .select("*")
            .eq("course_id", courseId)
            .order("order_index", { ascending: true });
        if (data) setModules(data);
    };

    const handleOpenModal = (course: any = null) => {
        if (course) {
            setCurrentCourse(course);
            setTitle(course.title_si);
            setDescription(course.description_si);
            setThumbnailUrl(course.thumbnail_url || "");
            setSlug(course.slug);
            setIsPremium(course.is_premium);
            fetchModules(course.id);
        } else {
            setCurrentCourse(null);
            setTitle("");
            setDescription("");
            setThumbnailUrl("");
            setSlug("");
            setIsPremium(false);
            setModules([]);
        }
        setShowModal(true);
    };

    const handleSaveCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const courseData = {
            title_si: title,
            description_si: description,
            thumbnail_url: thumbnailUrl,
            slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            is_premium: isPremium
        };

        if (currentCourse) {
            const { error } = await supabase
                .from("video_courses")
                .update(courseData)
                .eq("id", currentCourse.id);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase
                .from("video_courses")
                .insert([courseData]);
            if (error) alert(error.message);
        }

        setSaving(false);
        setShowModal(false);
        fetchCourses();
    };

    const handleOpenModuleModal = (module: any = null) => {
        if (module) {
            setCurrentModule(module);
            setModTitle(module.title_si);
            setModDesc(module.description_si);
            setModUrl(module.youtube_url);
            setModOrder(module.order_index);
        } else {
            setCurrentModule(null);
            setModTitle("");
            setModDesc("");
            setModUrl("");
            setModOrder(modules.length);
        }
        setShowModuleModal(true);
    };

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();
        setModuleSaving(true);

        const moduleData = {
            course_id: currentCourse.id,
            title_si: modTitle,
            description_si: modDesc,
            youtube_url: modUrl,
            order_index: modOrder
        };

        if (currentModule) {
            const { error } = await supabase
                .from("video_modules")
                .update(moduleData)
                .eq("id", currentModule.id);
        } else {
            const { error } = await supabase
                .from("video_modules")
                .insert([moduleData]);
        }

        setModuleSaving(false);
        setShowModuleModal(false);
        fetchModules(currentCourse.id);
    };

    const handleDeleteModule = async (id: string) => {
        if (confirm("මෙම මොඩියුලය මකා දැමීමට ඔබට විශ්වාසද?")) {
            await supabase.from("video_modules").delete().eq("id", id);
            fetchModules(currentCourse.id);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black font-outfit mb-2">Video Courses CMS</h1>
                    <p className="text-gray-400">Create premium video masterclasses and manage curriculum.</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> New Video Course
                </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-indigo-400 mx-auto" size={40} /></div>
                ) : courses.map((course) => (
                    <div key={course.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 relative group transition-all">
                        <div className="aspect-video rounded-2xl bg-gray-800 overflow-hidden mb-6 relative">
                            {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title_si} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5"><Video className="text-gray-700" size={32} /></div>
                            )}
                            {course.is_premium && (
                                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-black tracking-widest text-white shadow-lg shadow-indigo-500/50">PREMIUM</div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold font-outfit text-white mb-2 line-clamp-2">{course.title_si}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Layers size={14} /> Masterclass
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenModal(course)}
                                className="flex-1 py-3 rounded-xl glass border-white/10 text-white text-xs font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                            >
                                <Edit size={14} /> Manage
                            </button>
                            <Link
                                href={`/video-courses/${course.slug}`}
                                target="_blank"
                                className="w-12 h-12 rounded-xl glass border-white/10 text-indigo-400 hover:bg-indigo-400/10 transition-all flex items-center justify-center shrink-0"
                            >
                                <ExternalLink size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Course Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="w-full max-w-6xl max-h-[90vh] glass rounded-[4rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-y-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-10 right-10 p-3 rounded-full glass border-white/10 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Left Column: Course Info */}
                            <div>
                                <h2 className="text-3xl font-black font-outfit text-white mb-8">{currentCourse ? "Edit Course" : "New Course"}</h2>
                                <form onSubmit={handleSaveCourse} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Course Title (Sinhala)</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            placeholder="පාඨමාලාවේ නම මෙතැන ඇතුළත් කරන්න"
                                            className="w-full px-5 py-4 rounded-2xl glass border border-white/10 text-white outline-none focus:border-indigo-500 transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            placeholder="කෙටි විස්තරයක්..."
                                            className="w-full px-5 py-4 rounded-2xl glass border border-white/10 text-white outline-none focus:border-indigo-500 transition-all text-sm leading-relaxed"
                                        />
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Slug</label>
                                            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-5 py-4 rounded-2xl glass border border-white/10 text-white text-xs font-mono" />
                                        </div>
                                        <div className="pt-6">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isPremium ? "bg-indigo-600" : "bg-gray-800"}`}>
                                                    <div onClick={() => setIsPremium(!isPremium)} className={`w-6 h-6 rounded-full bg-white transition-all transform ${isPremium ? "translate-x-6" : ""}`} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-400">Premium</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-center pt-8">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg shadow-xl shadow-white/10 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Update Course Base
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right Column: Module Management */}
                            {currentCourse && (
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black font-outfit text-white">Curriculum</h2>
                                        <button
                                            onClick={() => handleOpenModuleModal()}
                                            className="px-4 py-2 rounded-xl glass border-indigo-500/30 text-indigo-400 text-xs font-black hover:bg-indigo-500 hover:text-white transition-all"
                                        >
                                            + Add Module
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[50vh] pr-4">
                                        {modules.length === 0 ? (
                                            <div className="p-10 text-center glass rounded-3xl border-dashed border-white/5 opacity-50">සක්‍රිය මොඩියුල නොමැත.</div>
                                        ) : modules.map((m, i) => (
                                            <div key={m.id} className="glass p-5 rounded-3xl border border-white/5 flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-black text-lg shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-bold text-white text-sm line-clamp-1">{m.title_si}</p>
                                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <Play size={10} fill="currentColor" /> {m.youtube_url.substring(0, 30)}...
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleOpenModuleModal(m)} className="p-3 rounded-xl hover:bg-white/5 text-gray-400"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteModule(m.id)} className="p-3 rounded-xl hover:bg-red-400/10 text-red-400"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Module Editor Modal */}
            {showModuleModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
                    <div className="w-full max-w-lg glass rounded-3xl p-10 border border-white/10 shadow-2xl relative">
                        <button onClick={() => setShowModuleModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white"><X size={20} /></button>
                        <h3 className="text-2xl font-black font-outfit text-white mb-8">{currentModule ? "Edit Lesson" : "New Lesson"}</h3>

                        <form onSubmit={handleSaveModule} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Lesson Title (Sinhala)</label>
                                <input value={modTitle} onChange={(e) => setModTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">YouTube Embed / Page URL</label>
                                <input value={modUrl} onChange={(e) => setModUrl(e.target.value)} required className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white outline-none focus:border-indigo-500 text-xs font-mono" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description</label>
                                <textarea value={modDesc} onChange={(e) => setModDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white outline-none focus:border-indigo-500 text-sm" />
                            </div>
                            <button type="submit" disabled={moduleSaving} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                                {moduleSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Lesson
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
