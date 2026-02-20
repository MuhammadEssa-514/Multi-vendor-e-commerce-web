import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import ChatWindow from "@/components/Chat/ChatWindow";
import Conversation from "@/models/Conversation";
import Customer from "@/models/Customer";
import Seller from "@/models/Seller";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/auth/login");

    const { id } = await params;
    await dbConnect();

    const conversation = await Conversation.findById(id).lean() as any;
    if (!conversation) notFound();

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const isParticipant = conversation.participants.some((p: any) => p.toString() === userId);
    if (!isParticipant) redirect("/dashboard");

    // Identify the other participant
    const recipientId = conversation.participants.find((p: any) => p.toString() !== userId);
    let recipientName = "User";

    const customer = await Customer.findById(recipientId).select("name email city country phone image").lean() as any;
    if (customer) recipientName = customer.name;
    else {
        const seller = await Seller.findById(recipientId).select("storeName name image").lean() as any;
        if (seller) recipientName = seller.storeName || seller.name;
    }

    // Build customer info panel (only shown when viewer is a seller)
    let customerInfo: { name: string; email: string; city?: string; country?: string; phone?: string; image?: string } | null = null;
    if (role === "seller" && customer) {
        customerInfo = {
            name: customer.name,
            email: customer.email,
            city: customer.city || null,
            country: customer.country || null,
            phone: customer.phone || null,
            image: customer.image || null,
        };
    }

    // Populate Product or Order context
    let contextualData: any = null;
    if (conversation.productId) {
        const Product = (await import("@/models/Product")).default;
        const product = await Product.findById(conversation.productId).select("name images price").lean() as any;
        if (product) {
            contextualData = {
                _id: product._id.toString(),
                name: product.name,
                image: product.images?.[0] || "",
                price: product.price,
                type: "product" as const
            };
        }
    } else if (conversation.orderId) {
        const Order = (await import("@/models/Order")).default;
        const order = await Order.findById(conversation.orderId).select("status totalPrice items").lean() as any;
        if (order) {
            // Try to grab the first item's image for display
            let firstItemImage = "";
            if (order.items?.[0]?.productId) {
                try {
                    const Product = (await import("@/models/Product")).default;
                    const p = await Product.findById(order.items[0].productId).select("images").lean() as any;
                    firstItemImage = p?.images?.[0] || "";
                } catch { /* ignore */ }
            }
            contextualData = {
                _id: order._id.toString(),
                name: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
                image: firstItemImage,
                price: order.totalPrice,
                type: "order" as const,
                status: order.status
            };
        }
    }

    return (
        <div className="max-w-4xl mx-auto h-full sm:h-auto sm:p-8 flex flex-col overflow-hidden">
            <div className="hidden sm:block mb-5">
                <Link
                    href="/dashboard/messages"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition mb-3"
                >
                    <ArrowLeft size={16} /> Back to Messages
                </Link>
                <h1 className="text-2xl font-black text-gray-900">
                    {role === "seller" ? `Chat with ${recipientName}` : `Chat with Seller`}
                </h1>
            </div>

            <div className="flex-1 min-h-0 sm:h-[650px] overflow-hidden">
                <ChatWindow
                    conversationId={id}
                    recipientName={recipientName}
                    currentUserId={userId}
                    currentUserRole={role}
                    productContext={contextualData}
                    customerInfo={customerInfo}
                />
            </div>
        </div>
    );
}
