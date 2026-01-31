
import { NextResponse } from "next/server";
import { migrateUsers } from "@/lib/migrate";
import { auth } from "@/auth";

export async function GET() {
    // Basic security check: You can comment this out if you are not logged in as admin yet
    const session = await auth();
    // if (!session || (session.user as any).role !== "admin") {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        const results = await migrateUsers();
        return NextResponse.json({
            success: true,
            message: "Migration process run.",
            results
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
