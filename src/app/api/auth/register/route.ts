import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Seller from "@/models/Seller";
import Notification from "@/models/Notification";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role, storeName, cnic, phoneNumber, city, country } = await req.json();

        if (!name || !email || !password || !role || !phoneNumber || !city || !country) {
            return NextResponse.json(
                { error: "Missing required fields (Name, Email, Password, Phone, City, and Country are mandatory)" },
                { status: 400 },
            );
        }

        if (role === "seller" && (!storeName || !cnic)) {
            return NextResponse.json(
                { error: "Merchants must provide store name and CNIC" },
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
            role,
            phoneNumber,
            city,
            country,
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
                userId: newUser._id,
                storeName,
                cnic,
                phoneNumber,
                approved: false,
            });

            // Notify Admins about the new seller request
            try {
                const admins = await User.find({ role: "admin" }).select("_id");
                if (admins.length > 0) {
                    const adminNotifications = admins.map(admin => ({
                        recipientId: admin._id,
                        recipientModel: "User",
                        type: "seller_approval",
                        title: "New Seller Request",
                        message: `A new merchant "${storeName}" has applied for an account and is awaiting approval.`,
                    }));
                    await Notification.insertMany(adminNotifications);
                }
            } catch (notifyError) {
                console.error("Failed to notify admins:", notifyError);
            }
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
