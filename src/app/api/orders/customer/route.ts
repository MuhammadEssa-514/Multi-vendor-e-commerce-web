import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole !== "customer") {
        return NextResponse.json({ error: "Only customers can view their orders." }, { status: 403 });
    }

    try {
        await dbConnect();

        const orders = await Order.find({ customerId: userId })
            .sort({ createdAt: -1 })
            .lean();

        const serializedOrders = orders.map((order: any) => ({
            ...order,
            _id: order._id.toString(),
            createdAt: order.createdAt.toString(),
            updatedAt: order.updatedAt.toString(),
            cancelledAt: order.cancelledAt ? order.cancelledAt.toString() : null,
        }));

        return NextResponse.json({ orders: serializedOrders }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
    }
}
