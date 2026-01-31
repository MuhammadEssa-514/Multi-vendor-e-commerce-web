import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import Seller from "@/models/Seller";
import Customer from "@/models/Customer";

export async function POST(req: Request) {
    try {
        const { userId, otp } = await req.json();

        if (!userId || !otp) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // Check all collections for the profile
        let account = await Admin.findById(userId);
        if (!account) {
            account = await Seller.findById(userId);
        }
        if (!account) {
            account = await Customer.findById(userId);
        }

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        if (account.isEmailVerified) {
            return NextResponse.json({ error: "Account already verified" }, { status: 400 });
        }

        // Validate OTP
        if (account.verificationOTP !== otp) {
            return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Check Expiry
        if (new Date() > account.verificationOTPExpire) {
            return NextResponse.json({ error: "Verification code expired. Please request a new one." }, { status: 400 });
        }

        // Mark as verified
        account.isEmailVerified = true;
        account.verificationOTP = undefined;
        account.verificationOTPExpire = undefined;
        await account.save();

        return NextResponse.json({ success: true, message: "Email verified successfully!" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
