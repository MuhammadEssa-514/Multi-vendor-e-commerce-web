import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Seller from "@/models/Seller";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role, storeName } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role, // Keep the role for initial user creation
        });

        // 6-Digit OTP Generation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await User.findByIdAndUpdate(newUser._id, {
            verificationOTP: otp, // In a real production app, you'd hash this, but for this demo/MVP we store it plain
            verificationOTPExpire: otpExpire
        });

        // Send Verification Email
        try {
            const { sendEmail } = await import("@/lib/mail");
            await sendEmail({
                to: email,
                subject: "Verify your Multi Vendor Account",
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                        <h2 style="color: #4F46E5;">Welcome to Multi Vendor!</h2>
                        <p>Protecting your account is our priority. Please use the following code to verify your identity:</p>
                        <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #111827;">${otp}</span>
                        </div>
                        <p style="font-size: 13px; color: #6B7280;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // We don't block registration if email fails in dev, but in prod you might
        }

        if (role === "seller" && storeName) {
            await Seller.create({
                userId: newUser._id, // Use newUser._id here
                storeName,
                approved: false,
            });
        }

        return NextResponse.json(
            { message: "User created successfully", userId: newUser._id },
            { status: 201 },
        );
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
