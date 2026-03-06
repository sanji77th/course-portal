"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
    Users,
    Search,
    ShieldAlert,
    ShieldCheck,
    Ban,
    MoreVertical,
    Globe,
    History,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        // Fetch profiles and join with IP counts (in a real app, use a RPC or view)
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("*, user_ips(ip_address)")
            .order("created_at", { ascending: false });

        if (profiles) {
            const processedUsers = profiles.map(u => ({
                ...u,
                ipCount: new Set(u.user_ips?.map((ip: any) => ip.ip_address) || []).size
            })).sort((a, b) => b.ipCount - a.ipCount); // Sort by highest IP count as requested

            setUsers(processedUsers);
        }
        setLoading(false);
    };

    const toggleBlock = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("profiles")
            .update({ is_blocked: !currentStatus })
            .eq("id", userId);

        if (!error) fetchUsers();
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black font-outfit mb-2">User Management</h1>
                    <p className="text-gray-400">Manage students, access status, and security alerts.</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl glass border border-white/5 outline-none focus:border-indigo-500/50 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {/* Security Table */}
            <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Unique IPs <ShieldAlert size={14} className="text-amber-500" />
                                </th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Last Login</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Loader2 size={40} className="animate-spin text-indigo-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                                                    {user.email?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white mb-0.5">{user.full_name || "New Student"}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.is_blocked ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-400/10 text-red-400 border border-red-400/20 text-xs font-bold">
                                                    <Ban size={12} /> BLOCKED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 text-xs font-bold">
                                                    <ShieldCheck size={12} /> ACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`text-xl font-black font-outfit ${user.ipCount > 3 ? "text-red-400" : user.ipCount > 1 ? "text-amber-400" : "text-indigo-400"}`}>
                                                    {user.ipCount}
                                                </div>
                                                <div className="flex flex-col">
                                                    {user.ipCount > 3 ? (
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter flex items-center gap-1">
                                                            <TrendingUp size={10} /> Suspicious
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Detected</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-sm text-indigo-400 font-medium">
                                            {user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => toggleBlock(user.id, user.is_blocked)}
                                                    className={`p-3 rounded-xl border transition-all ${user.is_blocked ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" : "bg-red-400/10 border-red-400/20 text-red-400 hover:bg-red-400/20"}`}
                                                    title={user.is_blocked ? "Unblock Account" : "Block Account"}
                                                >
                                                    {user.is_blocked ? <ShieldCheck size={18} /> : <Ban size={18} />}
                                                </button>
                                                <button className="p-3 rounded-xl glass border-white/10 text-white hover:bg-white hover:text-black transition-all">
                                                    <History size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[3rem] glass-card border-red-500/20 bg-red-400/[0.02]">
                    <h3 className="text-xl font-bold font-outfit mb-6 flex items-center gap-3 text-red-400">
                        <ShieldAlert size={24} />
                        Policy Violations
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                        අධික ලෙස IP ලිපිනයන් භාවිත කරන ගිණුම් පිළිබඳව සැලකිලිමත් වන්න. සාමාන්‍යයෙන් එක් ගිණුමක් IP 2-3 කට වඩා භාවිත නොකළ යුතුය.
                    </p>
                    <div className="w-full h-1 bg-white/5 rounded-full mb-2 overflow-hidden">
                        <div className="w-1/4 h-full bg-red-500" />
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Alert Sensitivity: High</p>
                </div>
            </div>
        </div>
    );
}
