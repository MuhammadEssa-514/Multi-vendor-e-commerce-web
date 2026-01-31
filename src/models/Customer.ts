import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
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
        default: "customer",
    },
    image: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
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
    phoneNumber: {
        type: String,
    },
    city: {
        type: String,
        required: [true, "Please provide your city"],
    },
    country: {
        type: String,
        required: [true, "Please provide your country"],
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }]
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
