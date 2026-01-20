
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
        return NextResponse.json({ error: "Only customers can place orders. Sellers must use a separate customer account to buy." }, { status: 403 });
    }

    try {
        const { items, total, paymentMethod, shippingAddress } = await req.json();
        const customerId = userId;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in orders" }, { status: 400 });
        }

        if (!shippingAddress) {
            return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
        }

        await dbConnect();

        // 1. Construct products array and check for self-buying
        const orderProducts = items.map((item: any) => {
            const sellerId = item.sellerId?._id || item.sellerId;

            // ANTI-SELF-BUY CHECK
            if (sellerId?.toString() === customerId.toString()) {
                throw new Error(`You cannot purchase your own product: ${item.name}`);
            }

            return {
                productId: item._id,
                sellerId: sellerId,
                quantity: item.quantity,
                price: item.price
            };
        });

        // Verify stock (Optional but recommended)
        // For MVP we skip strict stock locking but ideally we decrement stock here.
        for (const item of items) {
            await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
        }

        const order = await Order.create({
            customerId,
            products: orderProducts,
            total,
            status: "pending",
            paymentStatus: paymentMethod === "COD" ? "unpaid" : "unpaid",
            paymentMethod,
            shippingAddress,
        });

        // 3. Calculate Commissions and Update Financials
        try {
            const COMMISSION_RATE = 0.10; // 10% platform fee

            for (const item of orderProducts) {
                const itemTotal = item.price * item.quantity;
                const commission = itemTotal * COMMISSION_RATE;
                const sellerShare = itemTotal - commission;

                // Create Transaction record for transparency
                await Transaction.create({
                    orderId: order._id,
                    sellerId: item.sellerId,
                    amount: itemTotal,
                    commission: commission,
                    sellerShare: sellerShare,
                    status: "pending"
                });

                // Update Seller's pending earnings
                await Seller.findOneAndUpdate(
                    { userId: item.sellerId },
                    { $inc: { pendingEarnings: sellerShare } }
                );
            }
        } catch (finErr) {
            console.error("Financial calculation failed:", finErr);
        }

        // 4. Create Notifications for Sellers
        try {
            const uniqueSellerIds = [...new Set(orderProducts.map((p: any) => p.sellerId?.toString()).filter(Boolean))];

            for (const sId of uniqueSellerIds) {
                await Notification.create({
                    recipientId: sId,
                    recipientModel: "User", // Role is seller, but model is User
                    type: "order_received",
                    title: "New Order Received",
                    message: `You have a new order (#${order._id.toString().slice(-6)}) for Rs. ${total}. Check your dashboard for details.`,
                    orderId: order._id,
                });
            }
        } catch (notifErr) {
            console.error("Failed to create notifications:", notifErr);
            // Don't fail the order if notifications fail
        }

        return NextResponse.json({ success: true, orderId: order._id }, { status: 201 });
    } catch (error) {
        console.error("Order creation failed:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
