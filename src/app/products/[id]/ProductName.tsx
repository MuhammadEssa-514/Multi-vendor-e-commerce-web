"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductNameProps {
    name: string;
}

export default function ProductName({ name }: ProductNameProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 80; // Characters to show before truncation
    const shouldTruncate = name.length > MAX_LENGTH;

    return (
        <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-3 tracking-tight">
                {shouldTruncate && !isExpanded ? (
                    <>
                        {name.slice(0, MAX_LENGTH)}...
                    </>
                ) : (
                    name
                )}
            </h1>

            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp size={14} />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown size={14} />
                            Read More
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
