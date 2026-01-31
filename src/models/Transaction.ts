import mongoose, { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller", // The seller ID from Sellers collection
            required: true,
        },
        amount: {
            type: Number,
            required: true, // Total amount for this item(s) from this seller
        },
        commission: {
            type: Number,
            required: true, // Amount owner took (e.g. 10%)
        },
        sellerShare: {
            type: Number,
            required: true, // Amount seller gets
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Transaction = models.Transaction || model("Transaction", TransactionSchema);
export default Transaction;
