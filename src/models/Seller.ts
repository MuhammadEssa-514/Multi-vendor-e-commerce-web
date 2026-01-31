import mongoose, { Schema, model, models } from "mongoose";

const SellerSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
        },
        role: {
            type: String,
            default: "seller",
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
        city: {
            type: String,
            required: [true, "Please provide your city"],
        },
        country: {
            type: String,
            required: [true, "Please provide your country"],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        verificationOTP: {
            type: String,
        },
        verificationOTPExpire: {
            type: Date,
        },
        welcomeShown: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true },
);

const Seller = models.Seller || model("Seller", SellerSchema);

export default Seller;
