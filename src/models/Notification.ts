
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
            enum: ["User", "Seller"],
            default: "User",
        },
        type: {
            type: String,
            enum: ["order_received", "order_status_update", "system", "seller_approval"],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
