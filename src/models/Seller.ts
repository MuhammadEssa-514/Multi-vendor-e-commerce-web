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
            default: false,
            index: true,
        },
        bio: {
            type: String,
        },
        balance: {
            type: Number,
            default: 0,
        },
        totalEarnings: {
            type: Number,
            default: 0,
        },
        pendingEarnings: {
            type: Number,
            default: 0,
        },
        commissionPaid: {
            type: Number,
            default: 0,
            index: true,
        },
        cnic: {
            type: String,
            required: [true, "Please provide CNIC number"],
            unique: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            required: [true, "Please provide a mobile number"],
        },
        welcomeShown: {
            type: Boolean,
            default: false, // For showing welcome popup
        },
    },
    { timestamps: true },
);

const Seller = models.Seller || model("Seller", SellerSchema);

export default Seller;
