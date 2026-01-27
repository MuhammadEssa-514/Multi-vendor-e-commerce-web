"use client";

import { useState } from "react";
import SellerWelcomePopup from "@/components/SellerWelcomePopup";
import { dismissWelcome } from "@/app/dashboard/seller/actions";

export default function SellerWelcomeWrapper({
    storeName,
    welcomeShown
}: {
    storeName: string,
    welcomeShown: boolean
}) {
    const [shouldShow, setShouldShow] = useState(!welcomeShown);

    if (!shouldShow) return null;

    const handleDismiss = async () => {
        setShouldShow(false);
        await dismissWelcome();
    };

    return <SellerWelcomePopup storeName={storeName} onDismiss={handleDismiss} />;
}
