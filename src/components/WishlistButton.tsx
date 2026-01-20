"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WishlistButtonProps {
    productId: string;
    variant?: "default" | "card";
    className?: string;
}

export default function WishlistButton({ productId, variant = "default", className = "" }: WishlistButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if product is in wishlist on mount
    useEffect(() => {
        const checkWishlist = async () => {
            if (!session) {
                setChecking(false);
                return;
            }

            try {
                const res = await fetch("/api/user/wishlist");
                const data = await res.json();
                const inWishlist = data.wishlist?.some((item: any) => item._id === productId);
                setIsWishlisted(inWishlist);
            } catch (error) {
                console.error("Failed to check wishlist", error);
            } finally {
                setChecking(false);
            }
        };

        checkWishlist();
    }, [session, productId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast.error("Please sign in to save items to your wishlist");
            router.push("/auth/signin");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/user/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId })
            });

            const data = await res.json();

            if (data.success) {
                setIsWishlisted(data.action === "added");
                toast.success(
                    data.action === "added"
                        ? "Added to your wishlist! ❤️"
                        : "Removed from wishlist"
                );
            } else {
                toast.error(data.message || "Failed to update wishlist");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return variant === "card" ? (
            <button className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-gray-300 z-10 ${className}`}>
                <Heart size={14} />
            </button>
        ) : (
            <button className={`text-gray-300 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${className}`}>
                <Heart size={16} /> Wishlist
            </button>
        );
    }

    if (variant === "card") {
        return (
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 ${isWishlisted
                        ? "text-rose-500 hover:text-rose-600"
                        : "text-gray-400 hover:text-rose-500"
                    } ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-white"} ${className}`}
            >
                <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isWishlisted
                    ? "text-rose-500 hover:text-rose-600"
                    : "text-gray-400 hover:text-rose-500"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
            {isWishlisted ? "Wishlisted" : "Wishlist"}
        </button>
    );
}
