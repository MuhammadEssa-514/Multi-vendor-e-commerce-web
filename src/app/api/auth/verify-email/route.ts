import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { userId, otp } = await req.json();

        if (!userId || !otp) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.isEmailVerified) {
            return NextResponse.json({ error: "Account already verified" }, { status: 400 });
        }

        // Validate OTP
        if (user.verificationOTP !== otp) {
            return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Check Expiry
        if (new Date() > user.verificationOTPExpire) {
            return NextResponse.json({ error: "Verification code expired. Please request a new one." }, { status: 400 });
        }

        // Mark as verified
        user.isEmailVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: "Email verified successfully!" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
