"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    BookOpen,
    Video,
    FileText,
    Key,
    ShieldAlert,
    LayoutDashboard,
    LogOut,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const adminNav = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Articles", href: "/admin/articles", icon: FileText },
    { name: "Text Courses", href: "/admin/text-courses", icon: BookOpen },
    { name: "Video Courses", href: "/admin/video-courses", icon: Video },
    { name: "Access Codes", href: "/admin/codes", icon: Key },
    { name: "IP Monitoring", href: "/admin/ips", icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/10 flex flex-col pt-8">
                <div className="px-6 mb-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <span className="font-bold">A</span>
                        </div>
                        <span className="font-bold text-lg font-outfit">Admin Panel</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {adminNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                pathname === item.href
                                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                            {pathname === item.href && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-sm text-gray-400 font-medium">Administrator Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">System Live</span>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
