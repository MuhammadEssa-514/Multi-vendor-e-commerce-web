import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { auth } from "@/auth";

export async function GET() {
    await dbConnect();
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
        const cart = await Cart.findOne({ userId: (session.user as any).id }).populate({
            path: 'items.productId',
            model: Product
        });

        if (!cart) {
            return NextResponse.json({ items: [] });
        }

        // Format items to match the CartItem type in frontend
        const formattedItems = cart.items.map((item: any) => {
            if (!item.productId) return null;
            return {
                ...item.productId.toObject(),
                _id: item.productId._id.toString(),
                quantity: item.quantity,
                sellerId: item.productId.sellerId.toString()
            };
        }).filter(Boolean);

        return NextResponse.json({ items: formattedItems });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
        const { items } = await req.json();

        // Map items to store only productId and quantity
        const cartItems = items.map((item: any) => ({
            productId: item._id,
            quantity: item.quantity
        }));

        const cart = await Cart.findOneAndUpdate(
            { userId: (session.user as any).id },
            { $set: { items: cartItems } },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, cart });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
