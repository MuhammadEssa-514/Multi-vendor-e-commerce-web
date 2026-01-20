import mongoose, { Schema, model, models } from "mongoose";

const SellerSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        storeName: {
            type: String,
            required: [true, "Please provide a store name"],
            unique: true,
        },
        approved: {
            type: Boolean,
            default: false, // Sellers need admin approval
        },
        bio: {
            type: String,
        },
        balance: {
            type: Number,
            default: 0, // Current amount available for withdrawal
        },
        totalEarnings: {
            type: Number,
            default: 0, // Total revenue generated ever
        },
        pendingEarnings: {
            type: Number,
            default: 0, // Earnings from orders not yet delivered
        },
        commissionPaid: {
            type: Number,
            default: 0, // Total commission paid to platform owner
        },
    },
    { timestamps: true },
);

const Seller = models.Seller || model("Seller", SellerSchema);

export default Seller;
