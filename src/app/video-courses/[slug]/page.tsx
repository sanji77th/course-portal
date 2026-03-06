"use client";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Play,
    Video,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    X,
    Loader2,
    Smartphone,
    CheckCircle2,
    Send
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function VideoCourseDetailPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const { slug } = params;
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [enrolling, setEnrolling] = useState(false);
    const [enrollSuccess, setEnrollSuccess] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // 1. Get Course
        const { data: courseData, error: courseError } = await supabase
            .from("video_courses")
            .select("*")
            .eq("slug", slug)
            .single();

        if (courseError || !courseData) {
            router.push("/video-courses");
            return;
        }
        setCourse(courseData);

        // 2. Get User
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // 3. Check Access
        if (user) {
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
            }
        }

        // 4. Get Modules
        const { data: moduleData } = await supabase
            .from("video_modules")
            .select("*")
            .eq("course_id", courseData.id)
            .order("order_index", { ascending: true });

        setModules(moduleData || []);
        setLoading(false);
    };

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }
        setEnrolling(true);

        // In a real app, this would trigger an Edge Function to send email
        // For now, record the request in Supabase
        const { error: enrollError } = await supabase
            .from("enrollment_requests")
            .insert([
                {
                    user_id: user.id,
                    course_id: course.id,
                    phone: phoneNumber
                }
            ]);

        if (enrollError) {
            setError("ලියාපදිංචි වීමේදී දෝෂයක් ඇති විය.");
            setEnrolling(false);
        } else {
            setEnrollSuccess(true);
            setEnrolling(false);
            // Simulate sending email to sanjithaamarathunga.ai@gmail.com
            console.log(`Sending enrollment email for ${user.email} with phone ${phoneNumber}`);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifyingCode(true);
        setError(null);

        // 1. Find if code exists and is valid (not activated or assigned to this user)
        const { data: codeData, error: codeError } = await supabase
            .from("access_codes")
            .select("*")
            .eq("code", accessCode)
            .eq("course_id", course.id)
            .single();

        if (codeError || !codeData) {
            setError("වැරදි ඇතුළත් කිරීමේ කේතයක්. කරුණාකර නැවත උත්සාහ කරන්න.");
            setVerifyingCode(false);
            return;
        }

        if (codeData.is_activated) {
            setError("මෙම කේතය දැනටමත් භාවිත කර ඇත.");
            setVerifyingCode(false);
            return;
        }

        // 2. Activate code
        const { error: activateError } = await supabase
            .from("access_codes")
            .update({
                is_activated: true,
                user_id: user.id,
                activated_at: new Date().toISOString()
            })
            .eq("id", codeData.id);

        if (activateError) {
            setError("කේතය සක්‍රිය කිරීමේදී ගැටලුවක් මතු විය.");
        } else {
            setHasAccess(true);
            setShowCodeModal(false);
        }
        setVerifyingCode(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="text-white animate-spin" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-black text-white relative">
            <Navbar />

            {/* Hero Header */}
            <div className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[200px] rounded-full -z-10" />
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">

                    {/* Left: Thumbnail/Preview */}
                    <div className="w-full lg:w-1/2 shrink-0 group">
                        <div className="aspect-video glass-card rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                            {course.thumbnail_url && (
                                <img src={course.thumbnail_url} alt={course.title_si} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                    onClick={() => !hasAccess ? setShowEnrollModal(true) : null}
                                    className="w-24 h-24 rounded-full glass border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 group/play"
                                >
                                    <Play className="text-white fill-white ml-2 group-hover:text-indigo-400 group-hover:fill-indigo-400 transition-colors" size={48} />
                                </button>
                            </div>
                            {course.is_premium && !hasAccess && (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full glass bg-indigo-600/40 border-indigo-500/30 text-white font-bold text-sm flex items-center gap-3 backdrop-blur-3xl animate-bounce">
                                    <ShieldCheck size={20} className="text-indigo-300" />
                                    මෙය PREMIUM පාඨමාලාවකි
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass bg-white/5 border-white/10 text-indigo-400 text-xs font-bold mb-6">
                            <Video size={14} />
                            VIDEO MASTERCLASS
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-outfit text-white mb-6 leading-tight">
                            {course.title_si}
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl px-4 lg:px-0">
                            {course.description_si}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {!hasAccess ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (!user) router.push("/login");
                                            else setShowEnrollModal(true);
                                        }}
                                        className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-white text-black font-bold text-lg hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-white/10 active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Enroll Now <Smartphone size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!user) router.push("/login");
                                            else setShowCodeModal(true);
                                        }}
                                        className="w-full sm:w-auto px-10 py-5 rounded-3xl glass border-indigo-500/30 text-indigo-400 font-bold text-lg hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-3"
                                    >
                                        සක්‍රිය කරන්න (Code) <ArrowRight size={20} />
                                    </button>
                                </>
                            ) : (
                                <p className="text-green-400 font-black text-xl flex items-center gap-3 bg-green-400/10 px-8 py-4 rounded-3xl border border-green-400/20">
                                    <CheckCircle2 size={24} /> ඔබට මේ සඳහා පූර්ණ ප්‍රවේශය ඇත.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Area */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-3xl font-black font-outfit text-white text-center md:text-left flex items-center gap-4">
                        <div className="w-12 h-1 bg-indigo-500" />
                        පාඩම් මාලාව (Course Content)
                    </h2>

                    <div className="grid gap-6">
                        {modules.map((module, idx) => {
                            const isLocked = course.is_premium && !hasAccess;
                            return (
                                <div
                                    key={module.id}
                                    className={`group relative glass rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-8 border border-white/5 transition-all ${isLocked ? "opacity-60 grayscale cursor-not-allowed" : "hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10"}`}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-3xl font-black font-outfit text-indigo-400 shrink-0">
                                        {idx + 1}
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-xl font-bold font-outfit text-white mb-2">{module.title_si}</h4>
                                        <p className="text-gray-500 text-sm line-clamp-1">{module.description_si}</p>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-4">
                                        {isLocked ? (
                                            <div className="p-3 rounded-full glass border-white/10 text-gray-500">
                                                <X size={20} />
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/video-courses/${slug}/${module.id}`}
                                                className="px-6 py-3 rounded-2xl bg-white/5 text-white font-bold text-sm border border-white/10 hover:bg-white hover:text-black transition-all flex items-center gap-3"
                                            >
                                                <Play size={16} fill="currentColor" /> දැන් නරඹන්න
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ENROLL MODAL */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-lg glass p-10 rounded-[3rem] border-white/10 shadow-[0_0_100px_-20px_rgba(79,70,229,0.5)] relative">
                        <button
                            onClick={() => setShowEnrollModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gray-400"
                        >
                            <X size={24} />
                        </button>

                        {enrollSuccess ? (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto scale-110">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2 className="text-3xl font-black font-outfit text-white">තොරතුරු ලැබුණා!</h2>
                                <p className="text-gray-400 leading-relaxed">අපි ඔයාව පෞද්ගලිකව සම්බන්ධ කරගෙන, ගෙවීම් විස්තර සහ ඔබේ සක්‍රිය කිරීමේ කේතය (Access Code) එවන්නම්.</p>
                                <button
                                    onClick={() => setShowEnrollModal(false)}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg"
                                >
                                    හරි, ස්තුතියි
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-black font-outfit text-white mb-4">Enroll Online</h2>
                                <p className="text-gray-400 mb-8">ඔබේ දුරකථන අංකය ඇතුළත් කරන්න. අපි ඔබට Whatsapp හෝ Email මගින් ගෙවීම් විස්තර එවන්නෙමු.</p>

                                <form onSubmit={handleEnroll} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">දුරකථන අංකය</label>
                                        <div className="relative">
                                            <Smartphone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="tel"
                                                required
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="07X XXX XXXX"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:border-indigo-500 transition-all font-bold text-lg"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        disabled={enrolling}
                                        className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {enrolling ? <Loader2 className="animate-spin" /> : "තොරතුරු එවන්න (Submit)"} <Send size={20} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ACTIVATE CODE MODAL */}
            {showCodeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-lg glass p-10 rounded-[3rem] border-white/10 shadow-[0_0_100px_-20px_rgba(79,70,229,0.5)] relative">
                        <button
                            onClick={() => setShowCodeModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gray-400"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-3xl font-black font-outfit text-white mb-2">සක්‍රිය කරන්න</h2>
                            <p className="text-gray-400">ඔබට ලැබුණු Access Code එක පහතින් ඇතුළත් කරන්න.</p>
                        </div>

                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center block">ACCESS CODE</label>
                                <input
                                    type="text"
                                    required
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                    placeholder="XXXX-XXXX-XXXX"
                                    className="w-full px-4 py-6 rounded-2xl bg-white/5 border border-white/10 outline-none text-center text-white focus:border-indigo-500 transition-all font-black text-3xl tracking-[0.5em] placeholder:tracking-normal placeholder:font-bold placeholder:text-lg"
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                disabled={verifyingCode}
                                className="w-full py-5 rounded-2xl bg-white text-black font-bold text-lg shadow-xl shadow-white/10 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {verifyingCode ? <Loader2 className="animate-spin" /> : "Activate Course"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
