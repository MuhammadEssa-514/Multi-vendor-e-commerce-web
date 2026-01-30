
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User";
import dbConnect from "./src/lib/db";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkUser() {
    await dbConnect();
    const email = "the-email-you-are-trying-to-login-with@example.com"; // Replace with actual email
    const user = await User.findOne({ email });

    if (!user) {
        console.log("User not found!");
        // List all users to see what's in there
        const allUsers = await User.find({}, { email: 1, name: 1 });
        console.log("All users in DB:", allUsers);
    } else {
        console.log("User found:", {
            id: user._id,
            email: user.email,
            passwordHash: user.password ? "Exists" : "Missing",
            role: user.role,
            isEmailVerified: user.isEmailVerified
        });

        const testPassword = "the-password-you-are-using"; // Replace with actual password
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log("Password match result:", isMatch);
    }

    process.exit(0);
}

checkUser().catch(err => {
    console.error(err);
    process.exit(1);
});
