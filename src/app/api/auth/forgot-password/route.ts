
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import Seller from "@/models/Seller";
import Customer from "@/models/Customer";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await dbConnect();

        // Check all collections
        let user = await Admin.findOne({ email });
        if (!user) {
            user = await Seller.findOne({ email });
        }
        if (!user) {
            user = await Customer.findOne({ email });
        }

        if (!user) {
            // Security: Don't reveal if user exists or not
            return NextResponse.json({ message: "If that email exists, a link has been sent." }, { status: 200 });
        }

        // Generate Token
        // Create a random reset token
        const resetBuffer = crypto.randomBytes(32);
        const resetToken = resetBuffer.toString('hex');

        // Hash it to store in DB
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token and expire (10 mins)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You have requested a password reset. Please go to this link to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link expires in 10 minutes.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                html: message,
            });
            return NextResponse.json({ message: "Email sent" }, { status: 200 });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return NextResponse.json({ error: "Email could not be sent" }, { status: 500 });
        }

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
