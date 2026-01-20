"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

const slides = [
    {
        id: 1,
        title: "Super Flash Sale",
        subtitle: "Up to 70% Off Electronics",
        bg: "bg-blue-600",
        image: "/banner1.jpg" // Placeholder or we use CSS gradients
    },
    {
        id: 2,
        title: "New Arrivals",
        subtitle: "Trendy Fashion for Everyone",
        bg: "bg-purple-600",
        image: "/banner2.jpg"
    },
    {
        id: 3,
        title: "Home & Living",
        subtitle: "Upgrade Your Space",
        bg: "bg-orange-500",
        image: "/banner3.jpg"
    }
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg shadow-lg group">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                        } ${slide.bg} flex items-center justify-center text-white`}
                >
                    <div className="text-center p-8">
                        <h2 className="text-4xl md:text-6xl font-bold mb-4 transform translate-y-0 transition-transform duration-700 animate-fade-in-up">{slide.title}</h2>
                        <p className="text-xl md:text-2xl mb-8 animate-fade-in-up delay-100">{slide.subtitle}</p>
                        <div className="space-x-4">
                            <Link href="/products" className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition animate-fade-in-up delay-200">
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Arrows */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
                <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition ${index === current ? "bg-white" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
