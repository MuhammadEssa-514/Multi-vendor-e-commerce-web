
import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                sellerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User", // or Seller
                    required: true,
                },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        total: { type: Number, required: true },
        status: {
            type: String, // Global status
            enum: ["pending", "shipped", "delivered"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid", "failed"],
            default: "unpaid",
        },
        paymentMethod: { type: String, required: true },
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, required: true },
            zipCode: { type: String, required: true },
        },
        trackingNumber: { type: String, default: "" },
        courier: { type: String, default: "" },
    },
    { timestamps: true },
);

const Order = models.Order || model("Order", OrderSchema);
export default Order;
