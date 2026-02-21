"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, TrendingUp } from "lucide-react";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        price: number;
        salePrice?: number;
        onSale?: boolean;
        images: string[];
        rating: number;
        numReviews: number;
        discount?: number;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const isSale = product.onSale && product.salePrice;
    const discount = product.discount || (isSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0);
    const displayPrice = isSale ? product.salePrice : product.price;
    const originalPrice = product.price;

    return (
        <div className="group bg-white rounded-lg border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col overflow-hidden relative">
            {/* Badges */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                {discount > 0 && (
                    <div className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        -{discount}%
                    </div>
                )}
                {product.rating && product.rating >= 4.5 && (
                    <div className="bg-white/95 backdrop-blur-sm text-yellow-600 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-yellow-100 shadow-sm">
                        <TrendingUp size={8} /> Top
                    </div>
                )}
            </div>

            <WishlistButton productId={product._id} variant="card" />

            {/* Image Section */}
            <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-white p-1.5">
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-contain transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                        <Star size={24} />
                    </div>
                )}
            </Link>

            {/* Info Section */}
            <div className="p-2.5 flex flex-col flex-1">
                <div className="mb-1.5">
                    <Link href={`/products/${product._id}`} className="text-[11px] sm:text-xs font-semibold text-gray-800 line-clamp-2 leading-tight hover:text-blue-600 transition-colors h-7 sm:h-8">
                        {product.name}
                    </Link>
                </div>

                <div className="mt-auto pt-1.5">
                    <div className="flex flex-col mb-1.5">
                        <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                            ₨ {displayPrice?.toLocaleString()}
                        </span>
                        {isSale && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-medium text-gray-400 line-through">
                                    ₨ {originalPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-rose-500">-{discount}%</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                        {product.numReviews > 0 ? (
                            <>
                                <div className="flex gap-0.5 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={8}
                                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                                            className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200"}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">{product.rating}</span>
                                <span className="text-gray-300 mx-1 text-[8px]">|</span>
                                <span className="text-[10px] font-medium text-gray-400">({product.numReviews})</span>
                            </>
                        ) : (
                            <span className="text-[10px] font-medium text-gray-400 italic">No reviews yet</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-blue-600 w-0 group-hover:w-full transition-all duration-300"></div>
        </div>
    );
}
