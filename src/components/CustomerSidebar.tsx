"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    UserCircle,
    LogOut,
    ChevronRight,
    ShoppingBag,
    Bell,
    Heart,
    MessageSquare,
    X
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "My Orders", icon: Package, href: "/dashboard/orders" },
    { name: "My Profile", icon: UserCircle, href: "/dashboard/profile" },
    { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
    { name: "Messages", icon: MessageSquare, href: "/dashboard/messages" },
    { name: "Wishlist", icon: Heart, href: "/dashboard/wishlist" }, // Placeholder for now
];

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export default function CustomerSidebar({ className, onNavigate }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={`w-64 bg-slate-900 text-white border-r border-slate-800 min-h-screen sticky top-0 flex-col shadow-xl flex-shrink-0 ${className || 'hidden lg:flex'}`}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between h-16">
                <div className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 transform group-hover:scale-110 transition-transform duration-300">
                        <Image
                            src="/broMart_logo.jpg"
                            alt="BroMart"
                            fill
                            className="object-contain brightness-110"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-white tracking-tighter leading-none">BroMart<span className="text-blue-500">514</span></span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 group-hover:text-blue-400 transition-colors">Customer</span>
                    </div>
                </div>
                {onNavigate && (
                    <button onClick={onNavigate} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
                <div className="px-4 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">My Account</span>
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors group ${isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight size={12} className="text-white/70" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600/10 text-blue-400 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-blue-600/20 transition border border-blue-500/20 mb-2"
                >
                    <ShoppingBag size={16} /> Back to Shop
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
}
