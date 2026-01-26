"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
    size?: "sm" | "md" | "lg";
    showName?: boolean;
    label?: string;
}

export default function UserAvatar({ size = "md", showName = false, label }: UserAvatarProps) {
    const [image, setImage] = useState<string | null>(null);
    const [name, setName] = useState<string>("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setImage(data.user?.image || null);
                    setName(data.user?.name || "User");
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        }
        fetchProfile();
    }, []);

    const sizeClasses = {
        sm: "w-8 h-8 sm:w-9 sm:h-9",
        md: "w-9 h-9",
        lg: "w-10 h-10 sm:w-12 sm:h-12",
    };

    const iconSizes = {
        sm: 16,
        md: 18,
        lg: 20,
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            {showName && (
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 leading-none">{name}</p>
                    {label && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>}
                </div>
            )}
            <div className={`${sizeClasses[size]} rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0`}>
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={iconSizes[size]} />
                    </div>
                )}
            </div>
        </div>
    );
}
