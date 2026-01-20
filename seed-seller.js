
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// We can't easily import TS models in JS without compilation.
// We will define temporary schemas here to match.

const MONGODB_URI = "mongodb://localhost:27017/multi-vendor"; // Hardcoding for simplicity or read from .env manually

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String
}, { timestamps: true });

const sellerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    storeName: String,
    approved: Boolean
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Seller = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
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

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
