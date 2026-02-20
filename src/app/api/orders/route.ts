
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

        // 1. Group items by Seller
        const sellerGroups: Record<string, any[]> = {};

        items.forEach((item: any) => {
            const sId = item.sellerId?._id || item.sellerId;
            if (!sId) throw new Error("Item missing seller ID");

            // ANTI-SELF-BUY CHECK
            if (sId.toString() === customerId.toString()) {
                throw new Error(`You cannot purchase your own product: ${item.name}`);
            }

            if (!sellerGroups[sId]) {
                sellerGroups[sId] = [];
            }
            sellerGroups[sId].push(item);
        });

        // 2. Create Orders for each seller
        const createdOrderIds: string[] = [];
        const COMMISSION_RATE = 0.10; // 10% platform fee

        for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
            // Calculate total for this specific seller's order
            const sellerOrderTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            // Format products for Order Schema
            const orderProducts = sellerItems.map((item) => ({
                productId: item._id,
                sellerId: sellerId,
                quantity: item.quantity,
                price: item.price
            }));

            // Create the Order
            const order = await Order.create({
                customerId,
                products: orderProducts,
                total: sellerOrderTotal, // Specific total for this seller's order
                status: "pending",
                paymentStatus: paymentMethod === "COD" ? "unpaid" : "unpaid",
                paymentMethod,
                shippingAddress,
            });

            createdOrderIds.push(order._id);

            // 3. Create Transactions & Update Financials (Per Item, linked to this Order)
            for (const item of orderProducts) {
                const itemTotal = item.price * item.quantity;
                const commission = itemTotal * COMMISSION_RATE;
                const sellerShare = itemTotal - commission;

                // Create Transaction record
                await Transaction.create({
                    orderId: order._id, // Linked to the specific order
                    sellerId: item.sellerId,
                    amount: itemTotal,
                    commission: commission,
                    sellerShare: sellerShare,
                    status: "pending"
                });

                // Update Seller's pending earnings
                await Seller.findByIdAndUpdate(
                    item.sellerId,
                    { $inc: { pendingEarnings: sellerShare } }
                );
            }

            // 4. Create Notification for THIS Seller
            try {
                await Notification.create({
                    recipientId: sellerId,
                    recipientModel: "Seller",
                    type: "order_received",
                    title: "New Order Received",
                    message: `You have a new order (#${order._id.toString().slice(-6)}) for Rs. ${sellerOrderTotal}. Check your dashboard for details.`,
                    orderId: order._id,
                });
            } catch (notifErr) {
                console.error(`Failed to notify seller ${sellerId}:`, notifErr);
            }

            // Decrement Stock (Optional MVP step)
            for (const item of sellerItems) {
                await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
            }
        }

        return NextResponse.json({ success: true, orderIds: createdOrderIds }, { status: 201 });
    } catch (error) {
        console.error("Order creation failed:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
