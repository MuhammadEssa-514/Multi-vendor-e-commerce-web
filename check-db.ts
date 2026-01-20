
import mongoose from "mongoose";
import User from "./src/models/User";
import Seller from "./src/models/Seller";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("No MONGODB_URI found");
    process.exit(1);
}

async function check() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to DB");

        const users = await User.find({});
        console.log("Users:", JSON.stringify(users, null, 2));

        const sellers = await Seller.find({});
        console.log("Sellers:", JSON.stringify(sellers, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
