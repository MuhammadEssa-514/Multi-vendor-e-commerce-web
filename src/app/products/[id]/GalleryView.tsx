"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryView({ images, name }: { images: string[], name: string }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-50 flex items-center justify-center text-gray-400 rounded-xl">
                No Image Available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square border border-gray-100 rounded-xl overflow-hidden bg-white group shadow-sm">
                <Image
                    src={images[activeIndex]}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails - More Elegant */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative w-14 h-14 rounded-lg overflow-hidden border transition-all flex-shrink-0 bg-white p-1 ${activeIndex === idx ? "border-blue-600 ring-2 ring-blue-50" : "border-gray-100 hover:border-gray-300"
                                }`}
                        >
                            <div className="relative w-full h-full">
                                <Image src={img} alt={`${name} thumb ${idx}`} fill sizes="56px" className="object-cover rounded-md" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
