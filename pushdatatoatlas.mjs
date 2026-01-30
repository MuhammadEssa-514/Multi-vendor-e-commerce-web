// pushdatatoatlas.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // load local environment variables

const LOCAL_URI = process.env.MONGODB_LOCAL_URI;
const ATLAS_URI = process.env.MONGODB_ATLAS_URI;

if (!LOCAL_URI || !ATLAS_URI) {
    throw new Error(
        "Please define both MONGODB_LOCAL_URI and MONGODB_ATLAS_URI in your .env.local"
    );
}

async function pushData() {
    try {
        // Connect to LOCAL MongoDB
        const localConn = await mongoose.createConnection(LOCAL_URI, { bufferCommands: false }).asPromise();
        console.log("✅ Connected to LOCAL MongoDB");

        // Connect to ATLAS MongoDB
        const atlasConn = await mongoose.createConnection(ATLAS_URI, { bufferCommands: false }).asPromise();
        console.log("✅ Connected to ATLAS MongoDB");

        // Get all collections from local DB
        const collections = await localConn.db.listCollections().toArray();

        for (const coll of collections) {
            const collName = coll.name;
            const localCollection = localConn.collection(collName);
            const atlasCollection = atlasConn.collection(collName);

            // Fetch all documents from local
            const localDocs = await localCollection.find({}).toArray();

            if (localDocs.length === 0) {
                console.log(`No documents in local collection: ${collName}`);
                continue;
            }

            // Merge: update existing documents by _id, insert new ones
            for (const doc of localDocs) {
                // Remove _id to allow MongoDB to create new one if not exists
                const { _id, ...data } = doc;

                // Upsert: if _id exists, update; if not, insert
                await atlasCollection.updateOne(
                    { _id: _id },
                    { $set: data },
                    { upsert: true }
                );
            }

            console.log(`✅ Merged ${localDocs.length} documents for collection: ${collName}`);
        }

        console.log("🎉 All local collections safely merged to Atlas!");

        await localConn.close();
        await atlasConn.close();
    } catch (err) {
        console.error("❌ Error pushing data to Atlas:", err);
    }
}

// Run the push function
pushData();
