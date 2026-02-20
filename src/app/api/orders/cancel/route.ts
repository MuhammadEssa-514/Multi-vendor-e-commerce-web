import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import Transaction from "@/models/Transaction";
import Seller from "@/models/Seller";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole !== "customer") {
        return NextResponse.json({ error: "Only customers can cancel orders." }, { status: 403 });
    }

    try {
        const { orderId, reason } = await req.json();

        if (!orderId || !reason) {
            return NextResponse.json({ error: "Order ID and cancellation reason are required." }, { status: 400 });
        }

        await dbConnect();

        // 1. Find and validate order
        const order = await Order.findById(orderId).lean();
        if (!order) {
            return NextResponse.json({ error: "Order not found." }, { status: 404 });
        }

        if (order.customerId.toString() !== userId.toString()) {
            return NextResponse.json({ error: "You are not authorized to cancel this order." }, { status: 403 });
        }

        if (order.status !== "pending") {
            return NextResponse.json({
                error: `Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.`
            }, { status: 400 });
        }

        // 2. Update order status (single operation)
        await Order.findByIdAndUpdate(orderId, {
            status: "cancelled",
            cancellationReason: reason,
            cancelledAt: new Date()
        });

        // 3. Parallel operations for better performance
        const COMMISSION_RATE = 0.10;
        const uniqueSellerIds = [...new Set(order.products.map((p: any) => p.sellerId?.toString()).filter(Boolean))];

        // Prepare bulk operations
        const stockUpdates = order.products.map((item: any) => ({
            updateOne: {
                filter: { _id: item.productId },
                update: { $inc: { stock: item.quantity } }
            }
        }));

        const sellerUpdates = order.products.map((item: any) => {
            const itemTotal = item.price * item.quantity;
            const sellerShare = itemTotal - (itemTotal * COMMISSION_RATE);
            return {
                updateOne: {
                    filter: { _id: item.sellerId },
                    update: { $inc: { pendingEarnings: -sellerShare } }
                }
            };
        });

        const notifications = uniqueSellerIds.map((sId) => ({
            recipientId: sId,
            recipientModel: "Seller",
            type: "order_cancelled",
            title: "Order Cancelled",
            message: `Order #${orderId.toString().slice(-6)} has been cancelled by the customer. Reason: ${reason}`,
            orderId: orderId,
        }));

        // Execute all operations in parallel for speed
        await Promise.allSettled([
            // Bulk stock restoration
            Product.bulkWrite(stockUpdates),
            // Bulk seller earnings reversal
            Seller.bulkWrite(sellerUpdates),
            // Update all transactions
            Transaction.updateMany(
                { orderId: orderId },
                { status: "cancelled" }
            ),
            // Create all notifications at once
            Notification.insertMany(notifications)
        ]);

        return NextResponse.json({
            success: true,
            message: "Order cancelled successfully.",
            orderId: orderId
        }, { status: 200 });

    } catch (error) {
        console.error("Order cancellation failed:", error);
        return NextResponse.json({ error: "Failed to cancel order." }, { status: 500 });
    }
}
