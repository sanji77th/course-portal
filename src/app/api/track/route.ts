import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
        }

        const headersList = await headers();
        let ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Unknown IP";

        // Handle multiple IPs in x-forwarded-for
        if (ip.includes(",")) {
            ip = ip.split(",")[0].trim();
        }

        const now = new Date().toISOString();

        // 1. Update last login/seen in profiles
        await supabase
            .from("profiles")
            .update({ updated_at: now, last_login: now })
            .eq("id", user.id);

        // 2. Track IP
        // First check if IP exists for this user
        const { data: existingIp } = await supabase
            .from("user_ips")
            .select("id")
            .eq("user_id", user.id)
            .eq("ip_address", ip)
            .single();

        if (existingIp) {
            // Update last_seen
            await supabase
                .from("user_ips")
                .update({ last_seen: now })
                .eq("id", existingIp.id);
        } else {
            // Insert new IP
            await supabase
                .from("user_ips")
                .insert({
                    user_id: user.id,
                    ip_address: ip,
                    last_seen: now
                });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error tracking activity:", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
