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
        rating?: number;
        reviews?: number;
        discount?: number;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const isSale = product.onSale && product.salePrice;
    const discount = product.discount || (isSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0);
    const displayPrice = isSale ? product.salePrice : product.price;
    const originalPrice = product.price;

    return (
        <div className="group bg-white rounded-[1.5rem] border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 cursor-pointer h-full flex flex-col overflow-hidden relative">

            {/* Badges */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10">
                {discount > 0 && (
                    <div className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg shadow-rose-200">
                        -{discount}%
                    </div>
                )}
                {product.rating && product.rating >= 4.5 && (
                    <div className="bg-white/90 backdrop-blur-sm text-yellow-600 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-sm flex items-center gap-1 border border-yellow-100">
                        <TrendingUp size={10} className="w-2.5 h-2.5 sm:w-auto sm:h-auto" /> Top Rated
                    </div>
                )}
            </div>

            <WishlistButton productId={product._id} variant="card" />

            {/* Image Section */}
            <Link href={`/products/${product._id}`} className="block relative aspect-[1/1] overflow-hidden bg-gray-50 p-2 sm:p-4">
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Star size={32} />
                    </div>
                )}
            </Link>

            {/* Info Section */}
            <div className="p-3 sm:p-5 flex flex-col flex-1 bg-white">
                <div className="mb-2 sm:mb-3">
                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5 sm:mb-1">Official Selection</span>
                    <Link href={`/products/${product._id}`} className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                        {product.name}
                    </Link>
                </div>

                <div className="mt-auto space-y-2 sm:space-y-3">
                    <div className="flex flex-col">
                        <span className="text-xs sm:text-base font-black text-gray-900 tracking-tighter">
                            ₨ {displayPrice?.toLocaleString()}
                        </span>
                        {isSale && (
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 line-through">
                                ₨ {originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                            <div className="flex text-yellow-400">
                                <Star size={10} fill="currentColor" className="w-2.5 h-2.5 sm:w-auto sm:h-auto" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{product.rating || "4.5"}</span>
                            <span className="text-gray-200">|</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{product.reviews || "12"} Sold</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Progress Bar - Premium Touch */}
            <div className="absolute bottom-0 left-0 h-1 bg-blue-600 w-0 group-hover:w-full transition-all duration-700"></div>
        </div>
    );
}
