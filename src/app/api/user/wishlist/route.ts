import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

// GET: Fetch user's wishlist
export async function GET() {
    await dbConnect();
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
        const user = await User.findById((session.user as any).id)
            .populate({
                path: 'wishlist',
                model: Product,
                select: 'name price salePrice onSale images category stock'
            })
            .lean();

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Format wishlist items
        const formattedWishlist = (user.wishlist || []).map((item: any) => ({
            ...item,
            _id: item._id.toString()
        }));

        return NextResponse.json({ wishlist: formattedWishlist });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Toggle product in wishlist (Add/Remove)
export async function POST(req: Request) {
    await dbConnect();
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Prevent sellers and admins from using wishlist
    const userRole = (session.user as any).role;
    if (userRole === "seller" || userRole === "admin") {
        return NextResponse.json({ message: "Only customers can use wishlist" }, { status: 403 });
    }

    try {
        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ message: "Product ID required" }, { status: 400 });
        }

        const user = await User.findById((session.user as any).id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Check if product exists in wishlist
        const wishlistIndex = user.wishlist.findIndex(
            (id: any) => id.toString() === productId
        );

        let action = "";
        if (wishlistIndex > -1) {
            // Remove from wishlist
            user.wishlist.splice(wishlistIndex, 1);
            action = "removed";
        } else {
            // Add to wishlist
            user.wishlist.push(productId);
            action = "added";
        }

        await user.save();

        return NextResponse.json({
            success: true,
            action,
            wishlistCount: user.wishlist.length
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
