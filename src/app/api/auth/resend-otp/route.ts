import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.isEmailVerified) {
            return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
        }

        // Generate new 6-Digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with new OTP
        user.verificationOTP = otp;
        user.verificationOTPExpire = otpExpire;
        await user.save();

        // Send Email
        await sendEmail({
            to: user.email,
            subject: "Your New Verification Code",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #4F46E5;">New Verification Code</h2>
                    <p>You requested a new verification code. Please use the following code to verify your identity:</p>
                    <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #111827;">${otp}</span>
                    </div>
                    <p style="font-size: 13px; color: #6B7280;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: "A new code has been sent to your email." });

    } catch (error: any) {
        console.error("Resend OTP Error:", error);
        return NextResponse.json({ error: "Failed to resend code. Please try again later." }, { status: 500 });
    }
}
