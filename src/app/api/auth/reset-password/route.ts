
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import Seller from "@/models/Seller";
import Customer from "@/models/Customer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // Hash the token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Check all collections
        let user = await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            user = await Seller.findOne({
                resetPasswordToken,
                resetPasswordExpire: { $gt: Date.now() },
            });
        }
        if (!user) {
            user = await Customer.findOne({
                resetPasswordToken,
                resetPasswordExpire: { $gt: Date.now() },
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Set new password
        user.password = await bcrypt.hash(password, 10);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
