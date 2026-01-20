
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create unique filename
        const filename = `${nanoid()}.${file.name.split('.').pop()}`;
        // Verify public/uploads exists or create it? 
        // For simplicity assuming public/uploads exists or writing to current dir.
        // Better: write to ./public/uploads

        const uploadDir = path.join(process.cwd(), "public/uploads");

        // Ensure directory exists (Node 10+ recursive)
        // await mkdir(uploadDir, { recursive: true }); 
        // Importing mkdir to be safe
        const { mkdir } = require("fs/promises"); // Using require strictly inside async function block if needed or top level? 
        // Mixed imports can be messy. Let's rely on standard fs/promises import above.

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // ignore if exists
        }

        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({
            message: "Success",
            url: `/uploads/${filename}`
        }, { status: 201 });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
