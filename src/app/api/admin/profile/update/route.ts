import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mail";

export async function PUT(req: Request) {
    try {
        const session = await auth();
        // Check if user is admin
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, city, country, image, currentPassword, newPassword, phoneNumber, cnic, br } = body;

        await dbConnect();

        const admin = await Admin.findById((session.user as any).id);

        if (!admin) {
            return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
        }

        // 1. Update Password if provided
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
            }

            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            if (!isMatch) {
                return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
            }

            if (newPassword.length < 6) {
                return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
            }

            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(newPassword, salt);
        }

        // 2. Handle Email Change & Verification
        let emailChanged = false;
        if (email && email !== admin.email) {
            // Check if email taken
            const emailExists = await Admin.findOne({ email });
            if (emailExists) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }

            admin.email = email;
            admin.isEmailVerified = false;

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            admin.verificationOTP = otp;
            admin.verificationOTPExpire = new Date(Date.now() + 3600000); // 1 hour

            // Send Verification Email
            await sendEmail({
                to: email,
                subject: "Verify your new email address",
                html: `
                    <div style="font-family: Arial, sans-serif; max-w-md mx-auto;">
                        <h2 style="color: #4F46E5;">Email Verification</h2>
                        <p>You requested to change your admin email address. Please use the verification code below to confirm this change:</p>
                        <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">${otp}</span>
                        </div>
                        <p>This code will expire in 1 hour.</p>
                        <p style="color: #6B7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                    </div>
                `
            });

            emailChanged = true;
        }

        // 3. Update Other Details
        if (name) admin.name = name;
        if (city) admin.city = city;
        if (country) admin.country = country;
        if (image) admin.image = image;
        if (phoneNumber) admin.phoneNumber = phoneNumber;
        if (cnic) admin.cnic = cnic;
        if (br) admin.br = br;

        await admin.save();

        return NextResponse.json({
            success: true,
            message: emailChanged ? "Profile updated! Please verify your new email." : "Profile updated successfully",
            requiresVerification: emailChanged
        });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
