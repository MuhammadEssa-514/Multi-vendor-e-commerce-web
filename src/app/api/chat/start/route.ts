import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Product from "@/models/Product";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { sellerId, productId, orderId } = await req.json();
        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        await dbConnect();

        let query: any = {};
        if (role === "customer") {
            query = { customerId: userId, sellerId: sellerId };
        } else if (role === "seller") {
            const body = await req.json(); // Fallback if data is in a different structure, though usually handled by destructuring above
            const customerId = body.customerId;
            if (!customerId) return NextResponse.json({ error: "Customer ID required" }, { status: 400 });

            query = { customerId: customerId, sellerId: userId };
        }

        let conversation = await Conversation.findOne(query);
        let isNewContext = false;

        if (!conversation) {
            conversation = await Conversation.create({
                ...query,
                productId: productId || null,
                orderId: orderId || null,
                participants: [query.customerId, query.sellerId]
            });
            isNewContext = true;
        } else {
            // Update context if a new product/order is provided and it's different
            if (productId && (!conversation.productId || conversation.productId.toString() !== productId)) {
                conversation.productId = productId;
                isNewContext = true;
            }
            if (orderId && (!conversation.orderId || conversation.orderId.toString() !== orderId)) {
                conversation.orderId = orderId;
                isNewContext = true;
            }
            if (isNewContext) await conversation.save();
        }

        // Professional Enhancement: Send an automatic message if a product context is provided
        if (productId && isNewContext && role === "customer") {
            const product = await Product.findById(productId).select("name").lean() as any;
            const productName = product ? product.name : "this product";

            const autoMessage = await Message.create({
                conversationId: conversation._id,
                senderId: userId,
                senderModel: "Customer",
                content: `Hi! I'm interested in ${productName}.`,
                productId: productId
            });

            // Update Conversation Last Message
            await Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage: {
                    content: autoMessage.content,
                    senderId: userId,
                    createdAt: new Date()
                },
                $inc: { "unreadCounts.seller": 1 }
            });

            // Trigger Pusher
            try {
                if (process.env.PUSHER_APP_ID && pusherServer) {
                    await pusherServer.trigger(`chat-${conversation._id}`, "new-message", autoMessage);
                }
            } catch (err) { }
        }

        return NextResponse.json({ success: true, conversationId: conversation._id });

    } catch (error: any) {
        console.error("Start Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
