
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import Transaction from "@/models/Transaction";
import Seller from "@/models/Seller";
import Admin from "@/models/Admin";
import Customer from "@/models/Customer";
import { revalidatePath } from "next/cache";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || (session.user as any).role !== "seller") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { status, trackingNumber, courier } = await req.json();


        if (!["pending", "shipped", "delivered"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await dbConnect();

        // Find the order
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Verify that this order contains products from this seller
        const isSellerOrder = order.products.some(
            (p: any) => p.sellerId?.toString() === (session.user as any).id
        );

        if (!isSellerOrder) {
            return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 });
        }

        // Update order fields using $set to bypass potential full-document validation issues
        const updateData: any = { status };
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (courier !== undefined) updateData.courier = courier;


        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: false }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }


        // Clear caches for all related dashboards
        revalidatePath("/dashboard/orders");
        revalidatePath("/dashboard/seller/orders");

        // --- FINANCIAL SETTLEMENT ---
        if (status === "delivered") {
            try {
                // Find all pending transactions for this order
                const transactions = await Transaction.find({ orderId: id, status: "pending" });

                for (const tx of transactions) {
                    // 1. Update Seller: Release pending -> Available balance
                    await Seller.findByIdAndUpdate(
                        tx.sellerId,
                        {
                            $inc: {
                                pendingEarnings: -tx.sellerShare,
                                balance: tx.sellerShare,
                                totalEarnings: tx.amount,
                                commissionPaid: tx.commission
                            }
                        }
                    );

                    // 2. Update Admin: Record platform commission
                    await Admin.updateMany(
                        {},
                        { $inc: { totalCommissionEarned: tx.commission } }
                    );

                    // 3. Complete the transaction
                    tx.status = "completed";
                    await tx.save();
                }
            } catch (finErr) {
                console.error("Financial settlement failed:", finErr);
            }
        }
        // ----------------------------

        // Create a notification for the customer
        try {
            await Notification.create({
                recipientId: order.customerId,
                recipientModel: "Customer",
                type: "order_status_update",
                title: `Order Status Updated: ${status.toUpperCase()}`,
                message: `Your order #${order._id.toString().slice(-6)} is now ${status}.${trackingNumber ? ` Tracking: ${trackingNumber} via ${courier}` : ""}`,
                orderId: order._id,
            });
        } catch (notifErr) {
            console.error("Failed to create update notification:", notifErr);
        }

        return NextResponse.json({ success: true, status: updatedOrder.status });
    } catch (error: any) {
        console.error("Order update failed ERROR:", error);
        console.error("Order update failed STACK:", error.stack);
        return NextResponse.json({
            error: error.message || "Failed to update order status",
            details: error.stack ? "Check server logs" : undefined
        }, { status: 500 });
    }
}
