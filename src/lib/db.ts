import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function dbConnect() {
    // 🔹 Choose URI based on environment
    const MONGODB_URI =
        process.env.NODE_ENV === "production"
            ? process.env.MONGODB_ATLAS_URI
            : process.env.MONGODB_LOCAL_URI;

    if (!MONGODB_URI) {
        throw new Error(
            "Please define MONGODB_LOCAL_URI for local or MONGODB_ATLAS_URI for production"
        );
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = { bufferCommands: false };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
