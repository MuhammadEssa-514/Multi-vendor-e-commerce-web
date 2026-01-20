
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
    try {
        const { orderId, status, transactionId } = await req.json();

        await dbConnect();

        if (status === "paid") {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: "paid"
            });
            // Ideally we also log transaction ID
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}
