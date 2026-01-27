
/// <reference types="node" />
import mongoose from "mongoose";
import User from "./src/models/User";
import Seller from "./src/models/Seller";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to DB");

        const email = "pending_seller@example.com";

        let user = await User.findOne({ email });
        if (!user) {
            console.log("Creating pending seller user...");
            const hashedPassword = await bcrypt.hash("password123", 10);
            user = await User.create({
                name: "Pending Seller",
                email,
                password: hashedPassword,
                role: "seller"
            });
        } else {
            console.log("User already exists");
        }

        let seller = await Seller.findOne({ userId: user._id });
        if (!seller) {
            console.log("Creating pending seller profile...");
            seller = await Seller.create({
                userId: user._id,
                storeName: "Pending Approval Store",
                approved: false
            });
        } else {
            console.log("Seller profile already exists. Resetting approval status...");
            seller.approved = false;
            await seller.save();
        }

        console.log("Seeding complete. A pending seller is ready for approval.");
        console.log("You can now go to /dashboard/admin and approve 'Pending Approval Store'.");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
