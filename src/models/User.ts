
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    role: {
        type: String,
        enum: ["customer", "seller", "admin"],
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
        // For existing users this will be empty, will be required in registration API
    },
    city: {
        type: String,
        required: [true, "Please provide your city"],
    },
    country: {
        type: String,
        required: [true, "Please provide your country"],
    },
    totalCommissionEarned: {
        type: Number,
        default: 0, // Only relevant for admins - total money earned from all sales
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
