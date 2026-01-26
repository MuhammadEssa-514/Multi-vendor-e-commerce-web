"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobileRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Check if viewport is mobile (less than 1024px - lg breakpoint)
        const checkAndRedirect = () => {
            // Only redirect if on mobile AND haven't redirected before in this session
            if (window.innerWidth < 1024 && !sessionStorage.getItem("dashboardVisited")) {
                sessionStorage.setItem("dashboardVisited", "true");
                router.push("/products");
            }
        };

        // Check on mount only (not on resize to avoid constant redirects)
        checkAndRedirect();
    }, [router]);

    return null;
}
