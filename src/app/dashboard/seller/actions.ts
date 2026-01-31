"use server";

import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import { auth } from "@/auth";

export async function dismissWelcome() {
    const session = await auth();
    if (!session || (session.user as any).role !== "seller") return;

    await dbConnect();
    await Seller.findByIdAndUpdate(
        (session.user as any).id,
        { welcomeShown: true }
    );
}
