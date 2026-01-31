import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import Seller from "@/models/Seller";
import Customer from "@/models/Customer";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const role = (session.user as any).role;
        const Model = role === "admin" ? Admin : (role === "seller" ? Seller : Customer);
        const user = await Model.findById((session.user as any).id).select("-password");

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, image } = await req.json();
        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        await dbConnect();

        const updateData: any = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;

        const Model = role === "admin" ? Admin : (role === "seller" ? Seller : Customer);

        // 1. Check for old image to delete
        if (image) {
            const oldUser = await Model.findById(userId).select("image");
            if (oldUser && oldUser.image && oldUser.image !== image) {
                deleteFromCloudinary(oldUser.image).catch(err => console.error("Profile image cleanup failed:", err));
            }
        }

        const updatedUser = await Model.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser.name,
                image: updatedUser.image,
            }
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
