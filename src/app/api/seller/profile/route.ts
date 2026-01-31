import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || (session.user as any).role !== "seller") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { storeName, bio } = await req.json();
        const userId = (session.user as any).id;

        await dbConnect();

        const updateData: any = {};
        if (storeName) updateData.storeName = storeName;
        if (bio !== undefined) updateData.bio = bio;

        const updatedSeller = await Seller.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedSeller) {
            return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Seller profile updated successfully",
            seller: {
                storeName: updatedSeller.storeName,
                bio: updatedSeller.bio,
            }
        });

    } catch (error) {
        console.error("Seller Profile Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
