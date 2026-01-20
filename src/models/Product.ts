import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a product name"],
        },
        description: {
            type: String,
            required: [true, "Please provide a description"],
        },
        price: {
            type: Number,
            required: [true, "Please provide a price"],
        },
        salePrice: {
            type: Number,
            default: null,
        },
        onSale: {
            type: Boolean,
            default: false,
        },
        stock: {
            type: Number,
            default: 0,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        images: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
            required: [true, "Please provide a category"],
        },
        attributes: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true },
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;
