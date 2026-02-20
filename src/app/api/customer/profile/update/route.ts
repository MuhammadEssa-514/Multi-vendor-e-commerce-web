import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mail";

export async function PATCH(req: NextRequest) {
    const session = await auth();

    if (!session || (session.user as any).role !== "customer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await req.json();
        const { name, email, image, phoneNumber, city, country, currentPassword, newPassword } = body;

        const customerId = (session.user as any).id;
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        let emailChanged = false;

        // Update basic profile fields
        if (name) customer.name = name;
        if (image) customer.image = image;
        if (phoneNumber !== undefined) customer.phoneNumber = phoneNumber;
        if (city) customer.city = city;
        if (country) customer.country = country;

        // Handle email change with pending verification
        if (email && email !== customer.email) {
            const emailExists = await Customer.findOne({ email });
            if (emailExists) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            // Store new email as PENDING (don't replace current email yet)
            customer.pendingEmail = email;
            customer.verificationOTP = otp;
            customer.verificationOTPExpire = otpExpiry;
            emailChanged = true;

            // Send verification email to NEW (pending) email address
            try {
                await sendEmail({
                    to: email,
                    subject: "Verify Your New Email Address - BroMart514",
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                                .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
                                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Email Verification Required</h1>
                                </div>
                                <div class="content">
                                    <p>Hello <strong>${customer.name}</strong>,</p>
                                    <p>You requested to change your email address to <strong>${email}</strong>.</p>
                                    <div class="warning">
                                        <strong>⚠️ Important:</strong> Your current email (<strong>${customer.email}</strong>) will remain active until you verify this new email. If this was a mistake, simply ignore this message.
                                    </div>
                                    <p>To complete the email change, please verify this new email address using the code below:</p>
                                    <div class="otp-box">
                                        <div class="otp-code">${otp}</div>
                                        <p style="margin-top: 10px; color: #6b7280;">This code expires in 15 minutes</p>
                                    </div>
                                    <p>If you didn't request this change, you can safely ignore this email. Your account will not be affected.</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; 2024 BroMart514. Secure & Encrypted Connection.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                });
            } catch (emailError) {
                console.error("Failed to send verification email:", emailError);
                return NextResponse.json({
                    error: "Failed to send verification code. Please try again."
                }, { status: 500 });
            }
        }

        // Handle password change
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, customer.password);
            if (!isMatch) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
            }
            customer.password = await bcrypt.hash(newPassword, 10);
        }

        await customer.save();

        return NextResponse.json({
            success: true,
            message: emailChanged
                ? "Email updated! Please check your new email for a verification code."
                : "Profile updated successfully",
            emailChanged,
            requiresVerification: emailChanged
        });

    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
