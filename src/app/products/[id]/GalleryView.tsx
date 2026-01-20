"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryView({ images, name }: { images: string[], name: string }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-50 flex items-center justify-center text-gray-400 rounded-[2rem]">
                No Image Available
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white group shadow-sm">
                <img
                    src={images[activeIndex]}
                    alt={name}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails - More Elegant */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative w-16 h-16 rounded-2xl overflow-hidden border transition-all flex-shrink-0 bg-white p-1.5 ${activeIndex === idx ? "border-orange-500 ring-4 ring-orange-50" : "border-gray-100 hover:border-gray-300"
                                }`}
                        >
                            <img src={img} alt={`${name} thumb ${idx}`} className="w-full h-full object-cover rounded-xl" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
