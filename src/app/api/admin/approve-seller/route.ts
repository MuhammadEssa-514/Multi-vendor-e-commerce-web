
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { sellerId } = await req.json();
        await dbConnect();

        const seller = await Seller.findByIdAndUpdate(sellerId, { approved: true }, { new: true });

        return NextResponse.json({ success: true, seller });
    } catch (error) {
        return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
    }
}
