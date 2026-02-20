import mongoose, { Schema, model, models } from "mongoose";

const ConversationSchema = new Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                index: true,
                refPath: 'participantModels' // Dynamic ref if we want, but usually just ID is enough if we query carefully. 
                // Actually, for simplicity in this system:
                // One is always Customer, one is Seller.
            }
        ],
        // To make it easy to find "My chat with Seller X":
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true,
            index: true
        },
        lastMessage: {
            content: { type: String, default: "" },
            senderId: { type: mongoose.Schema.Types.ObjectId },
            createdAt: { type: Date, default: Date.now }
        },
        unreadCounts: {
            customer: { type: Number, default: 0 },
            seller: { type: Number, default: 0 }
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            index: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            index: true
        }
    },
    { timestamps: true }
);

// Compound index to ensure unique chat per customer-seller pair (can be linked to product or order)
// Note: We keep the customer-seller pair unique for a general "Inbox" but allow metadata updates.
ConversationSchema.index({ customerId: 1, sellerId: 1 }, { unique: true });

const Conversation = models.Conversation || model("Conversation", ConversationSchema);
export default Conversation;
