
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import Notification from "@/models/Notification";
import User from "@/models/User"; // Ensure User model is registered for notifications
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

        const currentSeller = await Seller.findById(sellerId);
        if (!currentSeller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

        // Check if the owner's email is verified
        const owner = await User.findById(currentSeller.userId);
        if (!owner?.isEmailVerified) {
            return NextResponse.json({
                error: "Verification Required",
                message: "This merchant has NOT verified their email yet. You cannot approve unverified accounts for security reasons."
            }, { status: 400 });
        }

        const newStatus = !currentSeller.approved;
        const seller = await Seller.findByIdAndUpdate(sellerId, { approved: newStatus }, { new: true });


        if (seller && seller.approved) {
            // Fire-and-forget notification so it doesn't block the response
            Notification.create({
                recipientId: seller.userId,
                recipientModel: "User",
                type: "seller_approval",
                title: "Congratulations! Your Store is Approved",
                message: `Step into your dashboard! "${seller.storeName}" has been approved by our admin team. You can now start adding products and managing your orders.`,
            }).then(() => {
            }).catch(err => {
                console.error("Async notification failed:", err.message);
            });
        }

        return NextResponse.json({ success: true, seller });
    } catch (error: any) {
        console.error("API Approval Catch Block:", error);
        return NextResponse.json({
            error: "Internal Server Error during approval",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
