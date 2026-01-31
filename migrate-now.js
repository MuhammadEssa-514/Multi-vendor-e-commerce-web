
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Extract URI from .env.local
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const mongoMatch = envContent.match(/MONGODB_LOCAL_URI=(.*)/);
const uri = mongoMatch ? mongoMatch[1].trim() : 'mongodb://localhost:27017/multi-vendor';

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        console.log('🚀 Connected to MongoDB:', uri);

        const sellersColl = db.collection('sellers');

        // 1. DROP LEGACY INDEXES
        try {
            console.log('🧹 Dropping legacy indexes...');
            await sellersColl.dropIndex('userId_1');
            console.log('✅ Dropped userId_1 index.');
        } catch (e) {
            console.log('ℹ️ userId_1 index not found or already dropped.');
        }

        const usersColl = db.collection('users');
        const adminsColl = db.collection('admins');
        const customersColl = db.collection('customers');

        const legacyUsers = await usersColl.find({}).toArray();
        console.log(`🔍 Found ${legacyUsers.length} total accounts in 'users' collection.`);

        let mCount = 0;
        let sCount = 0;

        for (const user of legacyUsers) {
            const role = user.role || 'customer';
            let targetColl;

            if (role === 'admin') targetColl = adminsColl;
            else if (role === 'seller') targetColl = sellersColl;
            else targetColl = customersColl;

            // Check if already exists in target by email
            const exists = await targetColl.findOne({ email: user.email });
            if (!exists) {
                const cleanUser = {
                    ...user,
                    city: user.city || 'Not Specified',
                    country: user.country || 'Not Specified'
                };

                // Specific adjustments for Sellers
                if (role === 'seller') {
                    cleanUser.approved = user.approved ?? true;
                    cleanUser.storeName = user.storeName || `${user.name}'s Store`;
                    // Use email as unique placeholder for CNIC if missing
                    cleanUser.cnic = user.cnic || `MIGRATED-${user.email}`;
                    delete cleanUser.userId;
                }

                await targetColl.insertOne(cleanUser);
                console.log(`✅ [${role.toUpperCase()}] Migrated: ${user.email}`);
                mCount++;
            } else {
                sCount++;
            }
        }

        console.log(`\n✨ Finished! Migrated: ${mCount}, Skipped: ${sCount}`);

        // Final sanity counts
        const aCount = await adminsColl.countDocuments();
        const cCount = await customersColl.countDocuments();
        const seCount = await sellersColl.countDocuments();
        console.log(`\n📊 New Totals: Admins: ${aCount}, Customers: ${cCount}, Sellers: ${seCount}`);

    } catch (err) {
        console.error('❌ Migration Error:', err);
    } finally {
        await client.close();
    }
}

run();
