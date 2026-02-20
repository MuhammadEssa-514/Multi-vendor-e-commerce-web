import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import Customer from "@/models/Customer";
import Seller from "@/models/Seller";
import Link from "next/link";
import { MessageCircle, User, Store, Package, ShoppingBag } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
    const session = await auth();
    if (!session) redirect("/auth/login");

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    await dbConnect();

    const conversations = await Conversation.find({ participants: userId })
        .sort({ updatedAt: -1 })
        .lean() as any[];

    const enrichedConversations = await Promise.all(conversations.map(async (conv: any) => {
        const otherId = conv.participants.find((p: any) => p.toString() !== userId);

        let name = "Unknown User";
        let image = "";
        let type = "user";

        const customer = await Customer.findById(otherId).select("name image").lean() as any;
        if (customer) {
            name = customer.name;
            image = customer.image || "";
            type = "customer";
        } else {
            const seller = await Seller.findById(otherId).select("storeName name image").lean() as any;
            if (seller) {
                name = seller.storeName || seller.name;
                image = seller.image || "";
                type = "seller";
            }
        }

        const unreadCount = role === "customer" ? conv.unreadCounts?.customer : conv.unreadCounts?.seller;

        // Fetch product or order context
        let contextTag: { label: string; type: "product" | "order" } | null = null;

        if (conv.productId) {
            try {
                const Product = (await import("@/models/Product")).default;
                const product = await Product.findById(conv.productId).select("name").lean() as any;
                if (product) {
                    contextTag = { label: product.name, type: "product" };
                }
            } catch { /* ignore */ }
        } else if (conv.orderId) {
            contextTag = {
                label: `Order #${conv.orderId.toString().slice(-6).toUpperCase()}`,
                type: "order"
            };
        }

        return {
            _id: conv._id.toString(),
            name,
            image,
            type,
            lastMessage: conv.lastMessage?.content || "No messages yet",
            lastMessageDate: conv.lastMessage?.createdAt,
            unreadCount: unreadCount || 0,
            contextTag
        };
    }));

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-400 font-medium">{enrichedConversations.length} conversation{enrichedConversations.length !== 1 ? "s" : ""}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {enrichedConversations.length === 0 ? (
                    <div className="p-16 text-center text-gray-400">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <MessageCircle size={36} className="text-blue-400" />
                        </div>
                        <p className="font-bold text-gray-600 text-lg">No messages yet</p>
                        <p className="text-sm mt-2">
                            {role === "customer"
                                ? "Visit a product page and tap \"Chat with Seller\" to start a conversation."
                                : "Your customer conversations will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {enrichedConversations.map((conv) => (
                            <Link
                                key={conv._id}
                                href={`/dashboard/messages/${conv._id}`}
                                className="block p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center gap-4 group"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {conv.image ? (
                                            <Image src={conv.image} alt={conv.name} width={52} height={52} className="w-full h-full object-cover" />
                                        ) : conv.type === "seller" ? (
                                            <Store size={22} className="text-gray-400" />
                                        ) : (
                                            <User size={22} className="text-gray-400" />
                                        )}
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`font-bold truncate group-hover:text-blue-600 transition-colors ${conv.unreadCount > 0 ? "text-gray-900" : "text-gray-700"}`}>
                                            {conv.name}
                                        </h3>
                                        <span className="text-[11px] text-gray-400 font-medium ml-2 flex-shrink-0">
                                            {conv.lastMessageDate
                                                ? new Date(conv.lastMessageDate).toLocaleDateString("en-PK", { day: "numeric", month: "short" })
                                                : ""}
                                        </span>
                                    </div>

                                    {/* Context tag */}
                                    {conv.contextTag && (
                                        <div className="flex items-center gap-1 mb-1">
                                            {conv.contextTag.type === "product" ? (
                                                <ShoppingBag size={10} className="text-indigo-400 flex-shrink-0" />
                                            ) : (
                                                <Package size={10} className="text-amber-500 flex-shrink-0" />
                                            )}
                                            <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${conv.contextTag.type === "product" ? "text-indigo-500" : "text-amber-600"}`}>
                                                {conv.contextTag.type === "product" ? "Re: " : ""}{conv.contextTag.label}
                                            </span>
                                        </div>
                                    )}

                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-400"}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
