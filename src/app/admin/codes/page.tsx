"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
    Key,
    Search,
    Plus,
    Trash2,
    Copy,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    AlertTriangle,
    Send,
    Calendar
} from "lucide-react";

export default function AdminCodesPage() {
    const [codes, setCodes] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // 1. Fetch Courses for Select
        const { data: courseData } = await supabase
            .from("video_courses")
            .select("id, title_si");
        setCourses(courseData || []);

        // 2. Fetch Codes
        const { data: codeData, error } = await supabase
            .from("access_codes")
            .select("*, video_courses(title_si), profiles(email)")
            .order("created_at", { ascending: false });

        if (codeData) setCodes(codeData);
        setLoading(false);
    };

    const generateCode = async () => {
        if (!selectedCourse) {
            alert("පාඨමාලාව තෝරන්න.");
            return;
        }
        setGenerating(true);

        const newCode = `LMS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const { error } = await supabase
            .from("access_codes")
            .insert([
                {
                    code: newCode,
                    course_id: selectedCourse,
                    is_activated: false
                }
            ]);

        if (!error) fetchData();
        setGenerating(false);
    };

    const deleteCode = async (id: string) => {
        const { error } = await supabase
            .from("access_codes")
            .delete()
            .eq("id", id);
        if (!error) fetchData();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("කේතය පිටපත් කරන ලදී.");
    };

    const filteredCodes = codes.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.video_courses?.title_si?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black font-outfit mb-2">Access Codes Engine</h1>
                    <p className="text-gray-400">Generate, monitor, and manage course access codes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="px-4 py-3 rounded-2xl glass border border-white/5 outline-none text-white text-sm"
                    >
                        <option value="">පාඨමාලාව තෝරන්න (Select Course)</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title_si}</option>
                        ))}
                    </select>
                    <button
                        onClick={generateCode}
                        disabled={generating}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {generating ? <Loader2 className="animate-spin" /> : <Plus size={20} />} Generate Code
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-[2rem] glass-card space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Total Generated</p>
                    <p className="text-3xl font-black font-outfit text-white">{codes.length}</p>
                </div>
                <div className="p-6 rounded-[2rem] glass-card space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 text-green-400">Activated</p>
                    <p className="text-3xl font-black font-outfit text-green-400">{codes.filter(c => c.is_activated).length}</p>
                </div>
                <div className="p-6 rounded-[2rem] glass-card space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 text-amber-400 text-center">Remaining</p>
                    <p className="text-3xl font-black font-outfit text-amber-400 text-center">{codes.filter(c => !c.is_activated).length}</p>
                </div>
                <div className="p-6 rounded-[2rem] glass-card space-y-3 bg-indigo-600/10">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 text-right">Last 24h</p>
                    <p className="text-3xl font-black font-outfit text-indigo-400 text-right">12</p>
                </div>
            </div>

            {/* Code Search */}
            <div className="relative w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={24} />
                <input
                    type="text"
                    placeholder="Search by code or course name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 rounded-[2rem] glass border border-white/5 outline-none focus:border-indigo-500 transition-all font-bold text-lg"
                />
            </div>

            {/* Codes Table */}
            <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-10 py-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Access Code</th>
                            <th className="px-10 py-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Attached Course</th>
                            <th className="px-10 py-8 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                            <th className="px-10 py-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Used By</th>
                            <th className="px-10 py-8 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <Loader2 size={40} className="animate-spin text-indigo-400 mx-auto" />
                                </td>
                            </tr>
                        ) : filteredCodes.map((c) => (
                            <tr key={c.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <code className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xl font-black font-outfit text-white tracking-widest">
                                            {c.code}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(c.code)}
                                            className="p-3 rounded-xl glass border-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <p className="font-bold text-gray-300 text-sm">{c.video_courses?.title_si || "Deleted Course"}</p>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Video Course</p>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    {c.is_activated ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-black">
                                            <CheckCircle2 size={12} /> ACTIVATED
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-black">
                                            <RefreshCw size={12} /> INACTIVE
                                        </div>
                                    )}
                                </td>
                                <td className="px-10 py-8 text-sm text-gray-500">
                                    {c.is_activated ? (
                                        <div className="flex flex-col">
                                            <p className="font-bold text-white mb-0.5">{c.profiles?.email}</p>
                                            <p className="text-[10px] flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(c.activated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-700 italic">Not in use</span>
                                    )}
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <button
                                        onClick={() => deleteCode(c.id)}
                                        disabled={c.is_activated}
                                        className="p-4 rounded-2xl glass border-white/10 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-20"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
