import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await auth();

    if (!session || (session.user as any).role !== "seller") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Ownership check
        if (product.sellerId.toString() !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized. This is not your product." }, { status: 403 });
        }

        const body = await req.json();

        // Clean up data
        const updateData = {
            ...body,
            price: body.price ? Number(body.price) : product.price,
            salePrice: body.salePrice ? Number(body.salePrice) : (body.onSale ? product.salePrice : null),
            stock: body.stock ? Number(body.stock) : product.stock,
        };

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await auth();

    if (!session || (session.user as any).role !== "seller") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Ownership check
        if (product.sellerId.toString() !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await Product.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Product deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
