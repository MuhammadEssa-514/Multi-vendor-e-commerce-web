
import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "recipientModel",
        },
        recipientModel: {
            type: String,
            required: true,
            enum: ["Admin", "Seller", "Customer"],
            default: "Customer",
        },
        type: {
            type: String,
            enum: ["order_received", "order_status_update", "system", "seller_approval", "new_message"],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
