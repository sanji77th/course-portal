"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Video, FileText, User, LayoutDashboard, Menu, X, LogOut, Loader2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const navItems = [
    { name: "ලිපි", href: "/articles", icon: FileText },
    { name: "පෙළ පාඨමාලා", href: "/text-courses", icon: BookOpen },
    { name: "වීඩියෝ පාඨමාලා", href: "/video-courses", icon: Video },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single();
                setUser({ ...user, is_admin: profile?.is_admin });

                // Track user activity in the background
                fetch("/api/track", { method: "POST" }).catch(err => console.error("Tracking failed:", err));
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", session.user.id)
                    .single();
                setUser({ ...session.user, is_admin: profile?.is_admin });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="glass shadow-2xl rounded-full px-6 py-3 flex items-center justify-between border border-white/10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-xl">L</span>
                        </div>
                        <span className="text-white font-bold text-xl hidden sm:block font-outfit tracking-tighter">LMS.si</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative px-5 py-2.5 rounded-full text-sm font-bold transition-all",
                                    pathname === item.href ? "text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                {pathname === item.href && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative flex items-center gap-2">
                                    <item.icon size={16} className={cn(pathname === item.href ? "text-indigo-400" : "text-gray-500")} />
                                    {item.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-3">
                        {loading ? (
                            <Loader2 size={20} className="animate-spin text-gray-500" />
                        ) : user ? (
                            <>
                                {user.is_admin && (
                                    <Link
                                        href="/admin"
                                        className={cn(
                                            "p-3 rounded-full hover:bg-white/10 transition-all border border-transparent",
                                            pathname.startsWith("/admin") ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "text-amber-500/60"
                                        )}
                                        title="Admin Panel"
                                    >
                                        <Shield size={20} />
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        "p-3 rounded-full hover:bg-white/10 transition-all border border-transparent",
                                        pathname === "/dashboard" ? "bg-white/10 text-white border-white/10" : "text-gray-400"
                                    )}
                                    title="Dashboard"
                                >
                                    <LayoutDashboard size={20} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-black shadow-xl shadow-white/5 hover:bg-indigo-400 hover:text-white transition-all transform active:scale-95"
                            >
                                LOGIN
                            </Link>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-gray-300 glass rounded-xl ml-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="md:hidden mt-4 glass rounded-[2.5rem] p-6 space-y-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all",
                                    pathname === item.href ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" : "text-gray-400 hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <item.icon size={22} />
                                <span className="font-bold text-lg">{item.name}</span>
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-white/5">
                            {user?.is_admin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 px-6 py-4 rounded-2xl mb-2 text-amber-400 hover:bg-amber-400/10 transition-all font-bold"
                                >
                                    <Shield size={22} /> පරිපාලක පුවරුව (Admin)
                                </Link>
                            )}
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-bold"
                                >
                                    <LogOut size={22} /> විසන්ධි වන්න
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center justify-center py-5 rounded-2xl bg-white text-black font-black text-lg"
                                >
                                    LOGIN
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    );
}
