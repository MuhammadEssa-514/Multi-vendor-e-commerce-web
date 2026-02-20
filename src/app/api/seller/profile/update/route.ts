import { auth } from "@/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "seller") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const sellerId = (session.user as any).id;

        await dbConnect();

        // Check if seller exists
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return NextResponse.json({ error: "Seller not found" }, { status: 404 });
        }

        // Handle Password Change
        if (body.currentPassword && body.newPassword) {
            const isMatch = await bcrypt.compare(body.currentPassword, seller.password);
            if (!isMatch) {
                return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
            }
            seller.password = await bcrypt.hash(body.newPassword, 10);
            await seller.save();
            return NextResponse.json({ message: "Password updated successfully" });
        }

        // Handle Profile Update
        // Validate Store Name uniqueness if changed
        if (body.storeName && body.storeName !== seller.storeName) {
            const existingStore = await Seller.findOne({ storeName: body.storeName });
            if (existingStore) {
                return NextResponse.json({ error: "Store name already taken" }, { status: 400 });
            }
        }

        // Update fields
        const fieldsToUpdate = [
            "name",
            "storeName",
            "bio",
            "phoneNumber",
            "city",
            "country",
            "image",
            "cnic"
        ];

        let emailChanged = false;

        fieldsToUpdate.forEach(field => {
            if (body[field] !== undefined) {
                seller[field] = body[field];
            }
        });

        // Email update handling (requires verification logic usually, but simplifed here as per requested scope for now)
        // If email changes, we should ideally trigger re-verification.
        if (body.email && body.email !== seller.email) {
            const existingEmail = await Seller.findOne({ email: body.email });
            if (existingEmail) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
            seller.email = body.email;
            seller.isEmailVerified = false; // Reset verification
            emailChanged = true;
        }

        await seller.save();

        return NextResponse.json({
            message: "Profile updated successfully",
            emailChanged: emailChanged,
            seller: {
                name: seller.name,
                storeName: seller.storeName,
                email: seller.email,
                image: seller.image,
            }
        });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
