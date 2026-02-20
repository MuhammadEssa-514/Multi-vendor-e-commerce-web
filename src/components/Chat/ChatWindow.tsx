"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Send, User, Loader2, Image as ImageIcon, Check, CheckCheck,
    Trash2, X, MoreVertical, MapPin, Mail, Phone, ShoppingBag, Package,
    ArrowLeft
} from "lucide-react";
import { pusherClient } from "@/lib/pusher";

interface Message {
    _id: string;
    content: string;
    senderId: string;
    createdAt: string;
    image?: string | null;
    isRead?: boolean;
    deletedForEveryone?: boolean;
    deletedFor?: string[];
    productId?: {
        _id: string;
        name: string;
        images: string[];
        price: number;
    } | null;
}

interface CustomerInfo {
    name: string;
    email: string;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    image?: string | null;
}

interface ChatWindowProps {
    conversationId: string;
    recipientName: string;
    currentUserId: string;
    currentUserRole?: string;
    productContext?: {
        _id: string;
        name: string;
        image: string;
        price: number;
        type?: "product" | "order";
        status?: string;
    } | null;
    customerInfo?: CustomerInfo | null;
}

const MESSAGE_TEMPLATE = `Hi! I'm interested in this product and have a few questions:

• Quantity needed: 
• Preferred variant (color/size): 
• Delivery city/address: 
• Any special requirements: 

Please let me know the availability and estimated delivery time. Thank you!`;

export default function ChatWindow({
    conversationId,
    recipientName,
    currentUserId,
    currentUserRole,
    productContext,
    customerInfo
}: ChatWindowProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // message id awaiting delete confirm
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const shouldScrollToBottom = useRef(true);
    const prevScrollHeightRef = useRef<number>(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isSeller = currentUserRole === "seller";

    // ─── Initial Fetch ───────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/${conversationId}/messages?limit=20`);
                const data = await res.json();
                if (data.messages) {
                    setMessages(data.messages);
                    setHasMore(data.hasMore);
                }
                fetch(`/api/chat/${conversationId}/messages`, { method: "PATCH" });
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const pc = pusherClient;
        if (!pc) {
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }

        const channelName = `chat-${conversationId}`;
        const channel = (pc as any).subscribe(channelName);

        channel.bind("new-message", (data: Message) => {
            setMessages((prev) => {
                if (prev.find((m) => m._id === data._id)) return prev;
                return [...prev, data];
            });
            shouldScrollToBottom.current = true;
            fetch(`/api/chat/${conversationId}/messages`, { method: "PATCH" });
        });

        channel.bind("messages-read", () => {
            setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
        });

        channel.bind("message-deleted", ({ messageId, mode }: { messageId: string; mode: string }) => {
            if (mode === "everyone") {
                setMessages((prev) =>
                    prev.map((m) =>
                        m._id === messageId
                            ? { ...m, deletedForEveryone: true, content: "This message was deleted", image: null }
                            : m
                    )
                );
            }
        });

        return () => {
            pc.unsubscribe(channelName);
            channel.unbind_all();
        };
    }, [conversationId]);

    // ─── Load More ───────────────────────────────────────────────────────────────
    const loadMore = async () => {
        if (!hasMore || fetchingMore || messages.length === 0) return;

        if (scrollRef.current) {
            prevScrollHeightRef.current = scrollRef.current.scrollHeight;
        }

        setFetchingMore(true);
        const oldestMessage = messages[0];
        try {
            const res = await fetch(`/api/chat/${conversationId}/messages?limit=20&before=${oldestMessage.createdAt}`);
            const data = await res.json();
            if (data.messages) {
                setMessages((prev) => [...data.messages, ...prev]);
                setHasMore(data.hasMore);
                shouldScrollToBottom.current = false;
            }
        } catch (err) {
            console.error("Load more failed", err);
        } finally {
            setFetchingMore(false);
        }
    };

    // ─── Auto-scroll & Scroll Position Management ────────────────────────────────
    useEffect(() => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;

        if (shouldScrollToBottom.current) {
            // Logic for new messages or initial mount
            // Only scroll to bottom if user is already near bottom OR they sent the message
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
            const lastMessage = messages[messages.length - 1];
            const sentByMe = lastMessage?.senderId === currentUserId;

            if (isAtBottom || sentByMe || loading) {
                container.scrollTop = container.scrollHeight;
            }
        } else {
            // Logic for pagination (maintaining position)
            const heightDelta = container.scrollHeight - prevScrollHeightRef.current;
            if (heightDelta > 0) {
                container.scrollTop = heightDelta;
            }
            // After adjusting, we allow auto-scroll for future NEW messages
            shouldScrollToBottom.current = true;
        }

        // Update height record for next check if needed
        prevScrollHeightRef.current = container.scrollHeight;
    }, [messages, loading]);

    // ─── Send Message ─────────────────────────────────────────────────────────────
    const handleSend = async (imageFile?: string) => {
        if (!newMessage.trim() && !imageFile) return;
        if (sending) return;
        setSending(true);

        const tempMessage: Message = {
            _id: Date.now().toString(),
            content: newMessage,
            senderId: currentUserId,
            createdAt: new Date().toISOString(),
            image: imageFile || null,
            isRead: false
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage("");
        shouldScrollToBottom.current = true;
        if (textareaRef.current) textareaRef.current.style.height = "56px";

        try {
            const res = await fetch(`/api/chat/${conversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: tempMessage.content || "Sent an image",
                    image: tempMessage.image
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages((prev) => prev.map((m) => m._id === tempMessage._id ? data.message : m));
            }
        } catch (err) {
            console.error("Failed to send", err);
        } finally {
            setSending(false);
        }
    };

    // ─── File Upload ──────────────────────────────────────────────────────────────
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) handleSend(data.url);
            else alert(data.error);
        } catch {
            alert("Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // ─── Delete Message ───────────────────────────────────────────────────────────
    const handleDeleteForMe = async (msgId: string) => {
        setMessages((prev) => prev.filter((m) => m._id !== msgId));
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setActiveMenu(null);
        try {
            await fetch(`/api/chat/${conversationId}/messages/delete?messageId=${msgId}&mode=me`, { method: "DELETE" });
        } catch { /* ignore */ }
    };

    const handleDeleteForEveryone = async (msgId: string) => {
        setMessages((prev) =>
            prev.map((m) =>
                m._id === msgId
                    ? { ...m, deletedForEveryone: true, content: "This message was deleted", image: null }
                    : m
            )
        );
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setActiveMenu(null);
        try {
            await fetch(`/api/chat/${conversationId}/messages/delete?messageId=${msgId}&mode=everyone`, { method: "DELETE" });
        } catch { /* ignore */ }
    };

    // ─── Auto-resize textarea ─────────────────────────────────────────────────────
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        const el = e.target;
        el.style.height = "56px";
        el.style.height = Math.min(el.scrollHeight, 160) + "px";
    };

    // ─── Visible messages (filter deleted for me) ─────────────────────────────────
    const visibleMessages = messages.filter(
        (m) => !m.deletedFor?.includes(currentUserId)
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Compact Mini-Profile Bar — Essentials for Sellers */}
            {isSeller && customerInfo && (
                <div className="mb-2 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-2xl px-4 py-2 flex items-center justify-between gap-4 shadow-sm group hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs flex-shrink-0 border border-indigo-200">
                            {customerInfo.image ? (
                                <img src={customerInfo.image} alt={customerInfo.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                customerInfo.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-black text-gray-900 leading-none truncate">{customerInfo.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5 truncate flex items-center gap-1">
                                <MapPin size={8} /> {[customerInfo.city, customerInfo.country].filter(Boolean).join(", ") || "No location"}
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                <Mail size={10} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 truncate max-w-[120px]">{customerInfo.email}</span>
                        </div>
                        {customerInfo.phone && (
                            <div className="flex items-center gap-1.5 border-l border-slate-100 pl-4">
                                <div className="w-5 h-5 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                                    <Phone size={10} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">{customerInfo.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="sm:hidden flex items-center gap-2">
                        <a href={`mailto:${customerInfo.email}`} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Mail size={12} /></a>
                        {customerInfo.phone && <a href={`tel:${customerInfo.phone}`} className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Phone size={12} /></a>}
                    </div>
                </div>
            )}

            {/* Main Chat Window */}
            <div className="flex flex-col h-full sm:h-[600px] bg-white sm:rounded-3xl sm:shadow-xl sm:border border-gray-100 overflow-hidden">

                {/* Header - Compact Design */}
                <div className="p-2 sm:p-3 bg-white border-b border-gray-100 flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-1 sm:hidden text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm text-xs sm:text-sm font-black flex-shrink-0">
                        {recipientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 leading-none truncate text-[13px] sm:text-sm">{recipientName}</h3>
                        <p className="text-[8px] sm:text-[9px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-tighter mt-0.5">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            {pusherClient ? "Live" : "Synced"}
                        </p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]" ref={scrollRef} onClick={() => setActiveMenu(null)}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <Loader2 className="animate-spin text-blue-600" size={28} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading…</p>
                        </div>
                    ) : (
                        <>
                            {hasMore && (
                                <div className="flex justify-center mb-2">
                                    <button
                                        onClick={loadMore}
                                        disabled={fetchingMore}
                                        className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-200/50 px-5 py-2 rounded-full hover:bg-slate-200 transition disabled:opacity-50"
                                    >
                                        {fetchingMore ? "Loading…" : "Load Older Messages"}
                                    </button>
                                </div>
                            )}

                            {/* Guided Prompt — shown to customer when no messages yet */}
                            {visibleMessages.length === 0 && !isSeller && productContext && (
                                <div className="mx-2 mt-4 p-5 bg-white border-2 border-dashed border-indigo-100 rounded-3xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                                            <ShoppingBag size={16} className="text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Inquiry Guide</p>
                                            <p className="text-sm font-bold text-gray-800">Re: {productContext.name}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                        For a faster response, include these details in your first message:
                                    </p>
                                    <ul className="space-y-1.5 mb-4">
                                        {["Quantity you need", "Preferred color or size/variant", "Your delivery city or address", "Any special requirements or questions"].map((hint) => (
                                            <li key={hint} className="flex items-start gap-2 text-xs text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                                                {hint}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => {
                                            setNewMessage(MESSAGE_TEMPLATE);
                                            textareaRef.current?.focus();
                                            if (textareaRef.current) {
                                                textareaRef.current.style.height = "56px";
                                                textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
                                            }
                                        }}
                                        className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition active:scale-[0.98]"
                                    >
                                        Use Message Template
                                    </button>
                                </div>
                            )}

                            {/* Empty state — seller side */}
                            {visibleMessages.length === 0 && (isSeller || !productContext) && (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400 opacity-60">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                        <Send size={20} />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
                                    <p className="text-xs mt-1">{isSeller ? "Waiting for the customer to reach out." : "Start the conversation!"}</p>
                                </div>
                            )}

                            {/* Messages */}
                            {visibleMessages.map((msg) => {
                                const isMe = msg.senderId === currentUserId;
                                const isDeleted = msg.deletedForEveryone;

                                return (
                                    <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative`}>
                                        <div className={`flex items-end gap-2 ${isMe ? "max-w-[90%] sm:max-w-[85%]" : "max-w-[85%]"}`}>
                                            {!isMe && (
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mb-1">
                                                    {recipientName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div
                                                className={`rounded-[18px] sm:rounded-[22px] px-3 sm:px-4 py-2 sm:py-3 text-[13px] sm:text-sm leading-relaxed ${isDeleted
                                                    ? "bg-slate-100 text-slate-400 italic border border-dashed border-slate-200"
                                                    : isMe
                                                        ? "bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-100"
                                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm"
                                                    }`}
                                            >
                                                {!isDeleted && msg.image && (
                                                    <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                                                        <img src={msg.image} alt="Sent" className="max-h-56 w-full object-cover" />
                                                    </div>
                                                )}
                                                <p className="font-medium tracking-tight whitespace-pre-wrap break-words">
                                                    {isDeleted ? "🚫 This message was deleted" : msg.content}
                                                </p>
                                                {!isDeleted && msg.productId && (
                                                    <div className={`mt-3 mb-1 p-2 rounded-xl flex items-center gap-2.5 border shadow-sm ${isMe ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-100"}`}>
                                                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100">
                                                            <img
                                                                src={msg.productId.images?.[0] || ""}
                                                                alt={msg.productId.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                                            <p className={`text-[11px] font-bold line-clamp-1 leading-tight ${isMe ? "text-white" : "text-gray-900"}`}>
                                                                {msg.productId.name}
                                                            </p>
                                                            <p className={`text-[10px] font-black ${isMe ? "text-blue-50" : "text-indigo-600"}`}>
                                                                ₨ {msg.productId.price.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={`/products/${msg.productId._id}`}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex-shrink-0 ${isMe
                                                                ? "bg-white text-blue-600 hover:bg-blue-50"
                                                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                                }`}
                                                        >
                                                            View
                                                        </a>
                                                    </div>
                                                )}
                                                <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                                    <span className={`text-[10px] font-bold ${isMe ? "text-blue-200" : "text-slate-400"}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                    {isMe && !isDeleted && (
                                                        <span className="text-blue-200">
                                                            {msg.isRead ? <CheckCheck size={13} className="text-green-300" /> : <Check size={13} />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Three-dot menu - ONLY for current user's messages */}
                                            {!isDeleted && isMe && (
                                                <div className={`relative opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mb-1 ${isMe ? "order-first" : "order-last"}`}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === msg._id ? null : msg._id);
                                                        }}
                                                        className="p-1.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                                                    >
                                                        <MoreVertical size={13} className="text-gray-400" />
                                                    </button>
                                                    {activeMenu === msg._id && (
                                                        <div className={`absolute bottom-full mb-1 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-44 ${isMe ? "right-0" : "left-0"}`}>
                                                            <button
                                                                onClick={() => { setDeleteTarget(msg._id); setShowDeleteModal(true); setActiveMenu(null); }}
                                                                className="w-full px-4 py-3 text-left text-xs font-bold text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                                                            >
                                                                <Trash2 size={13} /> Delete Message
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-2 sm:p-4 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom,16px)]">
                    <div className="flex items-end gap-1.5 sm:gap-2">
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="p-2.5 sm:p-3 bg-slate-100 text-slate-500 rounded-xl sm:rounded-2xl hover:bg-slate-200 hover:text-indigo-600 transition active:scale-90 flex-shrink-0"
                        >
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                        </button>
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={handleTextareaChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={isSeller ? "Reply to customer…" : "Type message…"}
                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl sm:rounded-[20px] px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm font-medium transition-all outline-none resize-none overflow-hidden"
                                style={{ minHeight: "44px", maxHeight: "150px" }}
                            />
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={(!newMessage.trim() && !uploading) || sending}
                            className="p-3 sm:p-4 bg-blue-600 text-white rounded-xl sm:rounded-[20px] hover:bg-blue-700 shadow-lg shadow-blue-100 transition active:scale-95 disabled:opacity-40 flex-shrink-0"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deleteTarget && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 text-center mb-1">Delete Message</h3>
                        <p className="text-sm text-gray-400 text-center mb-6">Choose how you want to delete this message.</p>

                        <div className="space-y-2">
                            <button
                                onClick={() => handleDeleteForMe(deleteTarget)}
                                className="w-full py-3 bg-slate-100 text-gray-700 font-bold rounded-2xl hover:bg-slate-200 transition text-sm"
                            >
                                🙈 Delete for Me
                                <span className="block text-[11px] font-normal text-gray-400 mt-0.5">Only you won't see it</span>
                            </button>

                            {/* Delete for everyone is only shown if this is the sender's message */}
                            {messages.find((m) => m._id === deleteTarget)?.senderId === currentUserId && (
                                <button
                                    onClick={() => handleDeleteForEveryone(deleteTarget)}
                                    className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition text-sm"
                                >
                                    🗑️ Delete for Everyone
                                    <span className="block text-[11px] font-normal text-red-200 mt-0.5">Removed for all participants</span>
                                </button>
                            )}

                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                                className="w-full py-2.5 text-gray-400 font-bold text-sm hover:text-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
