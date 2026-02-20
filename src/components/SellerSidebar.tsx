"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    DollarSign,
    UserCircle,
    LogOut,
    ChevronRight,
    X,
    PlusCircle,
    MessageCircle
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard/seller" },
    { name: "My Orders", icon: Package, href: "/dashboard/seller/orders" },
    { name: "My Products", icon: ShoppingBag, href: "/dashboard/seller/products" },
    { name: "Messages", icon: MessageCircle, href: "/dashboard/messages" },
    { name: "Financials", icon: DollarSign, href: "/dashboard/seller/financials" },
    { name: "Shop Profile", icon: UserCircle, href: "/dashboard/seller/profile" },
];

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export default function SellerSidebar({ className, onNavigate }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={`w-64 bg-slate-900 text-white border-r border-slate-800 min-h-screen sticky top-0 flex-col shadow-xl flex-shrink-0 ${className || 'hidden lg:flex'}`}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <ShoppingBag className="text-white" size={16} />
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tight block leading-none">Seller<span className="text-blue-500">Pro</span></span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Merchant</span>
                    </div>
                </div>
                {onNavigate && (
                    <button onClick={onNavigate} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
                <div className="px-4 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operations</span>
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
                    href="/dashboard/seller/add-product"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600/10 text-indigo-400 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-600/20 transition border border-indigo-500/20 mb-2"
                >
                    <PlusCircle size={16} /> Add New Product
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
