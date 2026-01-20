"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { CheckCircle, XCircle } from "lucide-react";

function MockPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const amount = searchParams.get("amount");
    const orderId = searchParams.get("orderId");
    const method = searchParams.get("method");
    const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");

    const handlePayment = async (success: boolean) => {
        if (!success) {
            setStatus("failed");
            return;
        }

        try {
            // Call webhook to update order
            const res = await fetch("/api/payments/webhook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    status: "paid",
                    transactionId: "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                }),
            });

            if (res.ok) {
                setStatus("success");
                setTimeout(() => {
                    router.push("/dashboard/orders");
                }, 2000);
            } else {
                setStatus("failed");
            }
        } catch (error) {
            setStatus("failed");
        }
    };

    if (status === "success") {
        return (
            <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful</h2>
                <p className="mt-2 text-gray-600">Redirecting to your orders...</p>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="text-center">
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h2>
                <p className="mt-2 text-gray-600">Please try again.</p>
                <button
                    onClick={() => setStatus("processing")}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
                >Retry</button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{method} Payment Gateway</h1>
                <p className="text-sm text-gray-500 mt-2">Mock Environment</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Merchant</span>
                    <span className="font-medium text-gray-900">Multi-Vendor Store</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-medium text-gray-900">{orderId?.slice(-6)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Amount</span>
                    <span>₨ {amount}</span>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => handlePayment(true)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    Pay Now (Success)
                </button>
                <button
                    onClick={() => handlePayment(false)}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition"
                >
                    Fail Transaction
                </button>
            </div>
            <p className="mt-4 text-xs text-center text-gray-400">
                This is a secure mock payment page. No real money will be deducted.
            </p>
        </div>
    );
}

export default function MockPaymentPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Suspense>
                <MockPaymentContent />
            </Suspense>
        </div>
    );
}
