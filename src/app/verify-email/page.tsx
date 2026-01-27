"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (!userId) {
            router.push("/auth/signin");
        }
    }, [userId, router]);

    // Handle Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length < 6) {
            setError("Please enter the full 6-digit code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, otp: fullOtp })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/auth/signin"), 3000);
            } else {
                setError(data.error || "Verification failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resending) return;

        setResending(true);
        setError("");

        try {
            const res = await fetch("/api/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            const data = await res.json();

            if (res.ok) {
                setCooldown(60); // 60 seconds cooldown
                setError("A new code has been sent!");
            } else {
                setError(data.error || "Failed to resend code");
            }
        } catch (err) {
            setError("Failed to resend code. Please try again.");
        } finally {
            setResending(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Verified!</h1>
                    <p className="text-gray-500 font-medium mb-8">Your account is now fully active. Redirecting you to login...</p>
                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[progress_3s_linear]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
                    <ShieldCheck size={32} />
                </div>

                <h1 className="text-3xl font-black text-gray-900 text-center mb-2">Verify Email</h1>
                <p className="text-gray-500 text-center text-sm font-medium mb-8">
                    We've sent a 6-digit code to your email.<br />Please enter it below to activate your account.
                </p>

                <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className="w-12 h-16 text-center text-2xl font-black text-indigo-600 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                        />
                    ))}
                </div>

                {error && (
                    <div className={`p-4 rounded-2xl text-xs font-bold mb-6 text-center border ${error.includes('sent') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify Account
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>

                <p className="mt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Didn't get the code?{" "}
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || resending}
                        className={`text-indigo-600 font-black hover:underline disabled:text-gray-300 disabled:no-underline`}
                    >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend Now"}
                    </button>
                </p>
            </div>
        </div>
    );
}
