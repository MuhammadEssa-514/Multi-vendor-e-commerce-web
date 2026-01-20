import mongoose, { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    }
}, { _id: false });

const CartSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: [CartItemSchema],
    },
    { timestamps: true }
);

const Cart = models.Cart || model("Cart", CartSchema);

export default Cart;
