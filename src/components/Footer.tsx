"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Send } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-50 text-gray-500 py-3 border-t border-gray-200/60 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                    {/* Column 1: Brand & About */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-8 h-8 transform group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src="/broMart_logo.jpg"
                                    alt="BroMart"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-blue-600 tracking-tighter leading-none">BroMart<span className="text-gray-900">514</span></span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none mt-1">Premium Market</span>
                            </div>
                        </Link>
                        <p className="text-xs leading-relaxed max-w-[260px]">
                            Elevating your shopping experience with premium electronics, fashion, and lifestyle essentials.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-gray-400">
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-gray-900 text-sm font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
                            Shop Categories
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            {["Mobiles & Tablets", "Electronics", "Fashion", "Beauty & Care"].map((link) => (
                                <li key={link}>
                                    <Link href="/products" className="hover:text-blue-500 transition-colors inline-block">{link}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Customer Care */}
                    <div>
                        <h4 className="text-gray-900 text-sm font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
                            Customer Support
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            {[
                                { icon: Mail, text: "support@bromart.com" },
                                { icon: MapPin, text: "514 Main St, PK" }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2.5">
                                    <item.icon size={13} className="text-blue-500" />
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h4 className="text-gray-900 text-sm font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
                            Stay Connected
                        </h4>
                        <form className="relative max-w-[260px]">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black"
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 text-white px-2.5 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                                <Send size={12} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-1 border-t border-gray-200/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                        <p>© 2026 <span className="text-gray-900 font-bold">BroMart Bazar</span>.</p>
                        <span className="text-gray-200 font-thin">|</span>
                        <p className="text-gray-400">By <span className="text-blue-600 font-bold">Muhammad Essa 514</span></p>
                    </div>

                    <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        <span>Visa</span>
                        <span>Master</span>
                        <span className="text-blue-500">JazzCash</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
