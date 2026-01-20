import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        await dbConnect();
        const reviews = await Review.find({ productId })
            .populate("customerId", "name")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId, rating, comment } = await req.json();

        if (!productId || !rating || !comment) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // Optional: Check if user already reviewed this product
        const existingReview = await Review.findOne({ productId, customerId: (session.user as any).id });
        if (existingReview) {
            return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
        }

        const review = await Review.create({
            productId,
            customerId: (session.user as any).id,
            rating,
            comment,
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
