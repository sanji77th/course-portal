"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { ShieldAlert, Search, Loader2, Globe, Clock, Ban, ShieldCheck } from "lucide-react";

export default function AdminIPsPage() {
    const [ips, setIps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchIPs();
    }, []);

    const fetchIPs = async () => {
        setLoading(true);
        // Fetch all IPs joined with profile info
        const { data: ipData, error } = await supabase
            .from("user_ips")
            .select("*, profiles(full_name, email, is_blocked)")
            .order("last_seen", { ascending: false });

        if (ipData) {
            setIps(ipData);
        }
        setLoading(false);
    };

    const toggleBlock = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("profiles")
            .update({ is_blocked: !currentStatus })
            .eq("id", userId);

        if (!error) fetchIPs();
    };

    const filteredIps = ips.filter(ip =>
        ip.ip_address?.includes(searchTerm) ||
        ip.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ip.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black font-outfit mb-2">IP Activity Log</h1>
                    <p className="text-gray-400">Monitor all unique device fingerprints and login locations.</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search IP or User..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl glass border border-white/5 outline-none focus:border-indigo-500/50 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {/* IP Table */}
            <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">IP Address</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Last Seen</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
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
                            ) : filteredIps.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-gray-500">
                                        <Globe size={40} className="mx-auto mb-4 opacity-50" />
                                        No IP records found. Activity will show up here soon.
                                    </td>
                                </tr>
                            ) : (
                                filteredIps.map((ip) => (
                                    <tr key={ip.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                                                    <Globe size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-lg tracking-wider mb-0.5">{ip.ip_address}</p>
                                                    <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-sm">Device Fingerprint</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-white mb-0.5">{ip.profiles?.full_name || "Unknown User"}</p>
                                            <p className="text-xs text-gray-500">{ip.profiles?.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium font-mono">
                                                <Clock size={16} className="text-gray-500" />
                                                {new Date(ip.last_seen).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {ip.profiles?.is_blocked ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-400/10 text-red-400 border border-red-400/20 text-xs font-bold">
                                                    <Ban size={12} /> BLOCKED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 text-xs font-bold">
                                                    <ShieldCheck size={12} /> ACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => toggleBlock(ip.user_id, ip.profiles?.is_blocked)}
                                                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${ip.profiles?.is_blocked ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" : "bg-red-400/10 border-red-400/20 text-red-400 hover:bg-red-400/20"}`}
                                                    title={ip.profiles?.is_blocked ? "Unblock User" : "Block User"}
                                                >
                                                    {ip.profiles?.is_blocked ? "UNBLOCK ACC" : "BLOCK ACC"}
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
        </div>
    );
}
