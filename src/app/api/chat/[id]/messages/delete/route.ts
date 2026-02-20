import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { pusherServer } from "@/lib/pusher";
import mongoose from "mongoose";

/**
 * DELETE /api/chat/[id]/messages?messageId=...&mode=me|everyone
 * mode=me      → soft-delete for the current user only (hides on their screen)
 * mode=everyone → hard-delete for all participants (marks deletedForEveryone)
 * 
 * Update: Only the SENDER can delete their own message (for both modes)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const messageId = searchParams.get("messageId");
        const mode = searchParams.get("mode") || "me"; // "me" | "everyone"

        if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });

        const userId = (session.user as any).id;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        await dbConnect();

        const message = await Message.findById(messageId);
        if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

        // Verify message belongs to this conversation
        if (message.conversationId.toString() !== id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Professional Restriction: ONLY the sender can delete their message
        if (message.senderId.toString() !== userId) {
            return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 });
        }

        if (mode === "everyone") {
            // Mark as deleted for everyone
            message.deletedForEveryone = true;
            message.content = "This message was deleted";
            message.image = null;
            await message.save();

            // Notify other participant in real-time
            try {
                if (process.env.PUSHER_APP_ID && pusherServer) {
                    await pusherServer.trigger(`chat-${id}`, "message-deleted", {
                        messageId,
                        mode: "everyone"
                    });
                }
            } catch { /* ignore pusher failure */ }

            return NextResponse.json({ success: true, mode: "everyone" });

        } else {
            // Delete for me only — add userObjectId to deletedFor array
            if (!message.deletedFor) message.deletedFor = [];

            const alreadyDeleted = message.deletedFor.some((d: any) => d.toString() === userId);

            if (!alreadyDeleted) {
                message.deletedFor.push(userObjectId);
                message.markModified('deletedFor');
            }
            await message.save();

            return NextResponse.json({ success: true, mode: "me" });
        }

    } catch (error: any) {
        console.error("Delete Message Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
