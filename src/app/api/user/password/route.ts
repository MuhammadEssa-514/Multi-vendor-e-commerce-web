import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import Seller from "@/models/Seller";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();
        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const Model = role === "admin" ? Admin : (role === "seller" ? Seller : Customer);
        const user = await Model.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Password Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
