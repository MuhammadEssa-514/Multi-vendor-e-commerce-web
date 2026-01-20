"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquare, Send, User } from "lucide-react";

interface Review {
    _id: string;
    customerId: {
        name: string;
    } | null;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function ReviewSection({ productId }: { productId: string }) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (err) {
            console.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, rating, comment }),
            });

            const data = await res.json();
            if (res.ok) {
                setComment("");
                setRating(5);
                fetchReviews(); // Refresh list
            } else {
                setError(data.error || "Failed to submit review");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0";

    return (
        <div className="mt-12 border-t pt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Product Reviews ({reviews.length})
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{averageRating} out of 5</span>
                    </div>
                </div>

                {!session && (
                    <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-md border border-gray-100 italic">
                        Please sign in to leave a review.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form Section */}
                {session && (
                    <div className="lg:col-span-1">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare size={18} className="text-blue-600" />
                                Write a Review
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-1 text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="hover:scale-110 transition cursor-pointer"
                                        >
                                            <Star size={24} fill={s <= rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like or dislike?"
                                    className="w-full text-sm border-gray-200 rounded-md p-3 focus:ring-1 focus:ring-blue-600 outline-none min-h-[120px] bg-gray-50"
                                    required
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? "Submitting..." : (
                                    <>Submit Review <Send size={14} /></>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <div className={`${session ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg" />)}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-gray-50 p-12 rounded-lg text-center border border-dashed border-gray-200">
                            <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        reviews.map((r) => (
                            <div key={r._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{r.customerId?.name || "Anonymous"}</p>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mt-2 whitespace-pre-wrap">
                                    {r.comment}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
