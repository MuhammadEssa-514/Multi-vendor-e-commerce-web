
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary using a promise to handle the stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "multi-vendor-uploads", // Organize in a folder
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const cloudinaryResult = result as any;

        return NextResponse.json({
            message: "Success",
            url: cloudinaryResult.secure_url, // Return the Cloudinary CDN URL
            publicId: cloudinaryResult.public_id
        }, { status: 201 });

    } catch (error: any) {
        console.error("Cloudinary Upload Error:", error);
        return NextResponse.json({
            error: "Upload failed",
            details: error.message
        }, { status: 500 });
    }
}
