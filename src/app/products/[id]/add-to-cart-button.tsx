"use client";

import { ShoppingCart, Zap, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function AddToCartButton({ product }: { product: any }) {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();
    const { addToCart, buyNow: executeBuyNow } = useCart();
    const { data: session } = useSession();
    const { showToast } = useToast();

    const handleAddToCart = () => {
        if (!session) {
            router.push("/auth/signin");
            return;
        }

        const userRole = (session.user as any).role;
        if (userRole === "seller") {
            showToast("Sellers cannot purchase products. Please use a customer account.", "info");
            return;
        }

        // ANTI-SELF-BUY CHECK
        const userId = (session.user as any).id;
        const productSellerId = product.sellerId?._id || product.sellerId;
        if (productSellerId?.toString() === userId.toString()) {
            showToast("You cannot purchase your own product.", "error");
            return;
        }

        setLoading(true);
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }

        setTimeout(() => {
            setLoading(false);
            showToast(`Success! ${quantity} ${product.name} added to cart.`, "success");
        }, 500);
    };

    const handleBuyNow = () => {
        if (!session) {
            router.push("/auth/signin");
            return;
        }

        const userRole = (session.user as any).role;
        if (userRole === "seller") {
            showToast("Sellers cannot purchase products.", "info");
            return;
        }

        // ANTI-SELF-BUY CHECK
        const userId = (session.user as any).id;
        const productSellerId = product.sellerId?._id || product.sellerId;
        if (productSellerId?.toString() === userId.toString()) {
            showToast("You cannot purchase your own product.", "error");
            return;
        }

        executeBuyNow(product);
        router.push("/checkout?mode=direct");
    };

    const isOutOfStock = product.stock !== undefined && product.stock <= 0;

    const incrementQty = () => {
        if (product.stock && quantity >= product.stock) return;
        setQuantity(prev => prev + 1);
    };

    const decrementQty = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    return (
        <div className="space-y-6">
            {/* Quantity Selector */}
            {!isOutOfStock && (
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 border border-gray-200">
                        <button
                            onClick={decrementQty}
                            className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                        <button
                            onClick={incrementQty}
                            className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    {product.stock && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {product.stock} units available
                        </span>
                    )}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={loading || isOutOfStock}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 border border-transparent rounded-[1.5rem] py-4 px-8 flex items-center justify-center text-sm font-bold text-white transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    <Zap className="mr-2 h-4 w-4 fill-current" />
                    {isOutOfStock ? "Out of Stock" : "Buy Now"}
                </button>
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={loading || isOutOfStock}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 border border-transparent rounded-[1.5rem] py-4 px-8 flex items-center justify-center text-sm font-bold text-white transition-all shadow-lg shadow-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
}
