"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

export default function WelcomePopup() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (searchParams.get("welcome") === "true" && session?.user) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                // Clean up the URL
                const params = new URLSearchParams(searchParams.toString());
                params.delete("welcome");
                router.replace(`?${params.toString()}`, { scroll: false });
            }, 3000); // Show for 3 seconds

            return () => clearTimeout(timer);
        }
    }, [searchParams, session, router]);

    if (!show || !session?.user) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <div className="bg-white rounded-lg shadow-2xl border border-blue-100 p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300 pointer-events-auto relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50" />

                <button
                    onClick={() => setShow(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={18} />
                </button>

                <div className="text-center relative z-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <span className="text-white text-2xl font-bold">
                            {session.user.name?.[0].toUpperCase()}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Welcome, {session.user.name}!
                    </h2>
                    <p className="text-gray-500 text-sm">
                        You are logged in as a <span className="text-blue-600 font-semibold">customer</span>.
                    </p>
                    <div className="mt-6 pt-6 border-t border-gray-100 italic text-[10px] text-gray-400">
                        Enjoy your shopping experience!
                    </div>
                </div>
            </div>
        </div>
    );
}
