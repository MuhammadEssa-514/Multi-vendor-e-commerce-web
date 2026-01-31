
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import Admin from "@/models/Admin";
import Customer from "@/models/Customer";
import Seller from "@/models/Seller";

// This is a temporary reference to the old collection
// We use a completely dynamic schema to avoid any registration conflicts
let User: any;
try {
    User = mongoose.model("User");
} catch (e) {
    User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
}

export async function migrateUsers() {
    await dbConnect();
    console.log("🚀 Starting Global Migration...");

    const users = await User.find({}).lean();
    console.log(`🔍 Found ${users.length} legacy accounts in 'users' collection.`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
        try {
            const role = user.role || "customer";

            if (role === "admin") {
                const exists = await Admin.findById(user._id);
                if (!exists) {
                    await Admin.collection.insertOne({
                        ...user,
                        role: "admin",
                        city: user.city || "Not Specified",
                        country: user.country || "Not Specified",
                        totalCommissionEarned: user.totalCommissionEarned || 0,
                        updatedAt: new Date(),
                        createdAt: user.createdAt || new Date()
                    });
                    console.log(`✅ [ADMIN] Migrated: ${user.email}`);
                    migratedCount++;
                } else {
                    skippedCount++;
                }
            } else if (role === "seller") {
                const exists = await Seller.findById(user._id);
                if (!exists) {
                    await Seller.collection.insertOne({
                        ...user,
                        role: "seller",
                        approved: user.approved ?? true,
                        storeName: user.storeName || `${user.name}'s Store`,
                        cnic: user.cnic || "Pending",
                        city: user.city || "Not Specified",
                        country: user.country || "Not Specified",
                        updatedAt: new Date(),
                        createdAt: user.createdAt || new Date()
                    });
                    console.log(`✅ [SELLER] Migrated: ${user.email}`);
                    migratedCount++;
                } else {
                    skippedCount++;
                }
            } else {
                // Customer
                const exists = await Customer.findById(user._id);
                if (!exists) {
                    await Customer.collection.insertOne({
                        ...user,
                        city: user.city || "Not Specified",
                        country: user.country || "Not Specified",
                        role: "customer",
                        updatedAt: new Date(),
                        createdAt: user.createdAt || new Date()
                    });
                    console.log(`✅ [CUSTOMER] Migrated: ${user.email}`);
                    migratedCount++;
                } else {
                    skippedCount++;
                }
            }
        } catch (err: any) {
            console.error(`❌ Failed to migrate ${user.email}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\n✨ Migration Result: ${migratedCount} migrated, ${skippedCount} already existed, ${errorCount} errors.`);
    return { migratedCount, skippedCount, errorCount };
}
