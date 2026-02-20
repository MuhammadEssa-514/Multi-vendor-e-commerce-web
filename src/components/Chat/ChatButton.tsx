"use client";

import { MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ChatButton({ sellerId, productId, orderId, label = "Chat with Seller" }: { sellerId: string, productId?: string, orderId?: string, label?: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const startChat = async () => {
        setLoading(true);
        if (!session) {
            router.push("/auth/login");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/chat/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId, productId, orderId }),
            });
            const data = await res.json();

            if (data.success) {
                router.push(`/dashboard/messages/${data.conversationId}`);
            } else {
                if (data.error === "Unauthorized") {
                    router.push("/auth/login");
                } else {
                    alert("Failed to start chat: " + data.error);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={startChat}
            disabled={loading}
            className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition active:scale-[0.98]"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
            <span className="text-xs uppercase tracking-widest">{label}</span>
        </button>
    );
}
