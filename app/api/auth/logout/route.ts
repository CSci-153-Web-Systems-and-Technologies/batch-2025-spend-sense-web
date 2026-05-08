import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        // Even if supabase fails to sign out on the server, we should clear the session cookies 
        // by returning a successful response, so the user isn't stuck.
        return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
    }
}
