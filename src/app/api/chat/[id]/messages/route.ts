import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

import { pusherServer } from "@/lib/pusher";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await params;

        const userId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        const before = searchParams.get("before");
        const limit = parseInt(searchParams.get("limit") || "20");

        await dbConnect();

        // Exclude messages the current user has deleted for themselves
        const userObjectId = new mongoose.Types.ObjectId(userId);
        let query: any = {
            conversationId: id,
            deletedFor: { $nin: [userObjectId] }   // exclude if userId is in deletedFor array
        };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("productId", "name images price")
            .lean();

        // Reverse back to chronological order for the frontend
        return NextResponse.json({
            messages: messages.reverse(),
            hasMore: messages.length === limit
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await params;
        const { content, image } = await req.json();

        const senderId = (session.user as any).id;
        const role = (session.user as any).role;
        const senderModel = role === "customer" ? "Customer" : "Seller";

        await dbConnect();

        const newMessage = await Message.create({
            conversationId: id,
            senderId,
            senderModel,
            content,
            image
        });

        // Update Conversation Last Message & Unread Counts
        const updateField = role === "customer" ? "unreadCounts.seller" : "unreadCounts.customer";

        await Conversation.findByIdAndUpdate(id, {
            lastMessage: {
                content,
                senderId,
                createdAt: new Date()
            },
            $inc: { [updateField]: 1 }
        });

        // Create Notification for the recipient
        try {
            const conversation = await Conversation.findById(id);
            if (conversation) {
                const recipientId = role === "customer" ? conversation.sellerId : conversation.customerId;
                const recipientModel = role === "customer" ? "Seller" : "Customer";
                const senderName = (session.user as any).name || "Someone";

                await Notification.create({
                    recipientId,
                    recipientModel,
                    type: "new_message",
                    title: `New Message from ${senderName}`,
                    message: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
                    conversationId: id
                });
            }
        } catch (navErr) {
            console.error("Notification Creation Error:", navErr);
        }

        // Real-time Push (Pusher) - Don't throw if env vars missing (beast mode)
        try {
            if (process.env.PUSHER_APP_ID && pusherServer) {
                await pusherServer.trigger(`chat-${id}`, "new-message", newMessage);
            }
        } catch (pusherErr) {
            console.error("Pusher Trigger Error:", pusherErr);
        }

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await params;
        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        await dbConnect();

        // Mark all messages sent by the OTHER person as read
        const otherModel = role === "customer" ? "Seller" : "Customer";

        await Message.updateMany(
            { conversationId: id, senderModel: otherModel, isRead: false },
            { $set: { isRead: true } }
        );

        // Reset unread count for the current user
        const updateField = role === "customer" ? "unreadCounts.customer" : "unreadCounts.seller";
        await Conversation.findByIdAndUpdate(id, { [updateField]: 0 });

        // Trigger real-time update for the other person to show "Read" ticks
        try {
            if (process.env.PUSHER_APP_ID && pusherServer) {
                await pusherServer.trigger(`chat-${id}`, "messages-read", { readerId: userId });
            }
        } catch (err) { }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update read status" }, { status: 500 });
    }
}
