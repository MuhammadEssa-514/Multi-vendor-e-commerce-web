
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb://localhost:27017/multi-vendor";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const email = "admin514@gmail.com";
        const password = "admin514";

        let user = await User.findOne({ email });
        if (!user) {
            console.log("Creating admin user...");
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                name: "Super Admin",
                email,
                password: hashedPassword,
                role: "admin"
            });
            console.log("Admin created.");
        } else {
            console.log("Admin user already exists.");
            if (user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
                console.log("Updated existing user to admin role.");
            }
        }

        console.log(`\nUser 'admin@example.com' is ready with password '${password}'.`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

seedAdmin();
