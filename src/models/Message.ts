import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        senderModel: {
            type: String,
            enum: ["Customer", "Seller"],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: null
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        // Delete for everyone: marks message as deleted globally
        deletedForEveryone: {
            type: Boolean,
            default: false
        },
        // Delete for me: array of userIds who deleted this message for themselves
        deletedFor: [{
            type: mongoose.Schema.Types.ObjectId
        }],
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null
        }
    },
    { timestamps: true }
);

// Professional Message Retention: Automatically delete messages after 30 days
// 30 days * 24 hours * 60 minutes * 60 seconds = 2,592,000 seconds
MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Message = models.Message || model("Message", MessageSchema);
export default Message;
