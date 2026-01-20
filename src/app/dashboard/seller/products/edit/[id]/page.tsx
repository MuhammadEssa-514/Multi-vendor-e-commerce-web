import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { Sparkles } from "lucide-react";
import ProductForm from "@/components/Seller/ProductForm";

async function getProduct(id: string, sellerId: string) {
    await dbConnect();
    const product = await Product.findOne({ _id: id, sellerId }).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session || (session.user as any).role !== "seller") {
        redirect("/dashboard");
    }

    const { id } = await params;
    const product = await getProduct(id, (session.user as any).id);

    if (!product) {
        notFound();
    }

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Edit Product</h2>
                    <p className="text-gray-500 mt-2 text-lg">Update your product listing details.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                    <Sparkles size={18} className="text-blue-600" />
                    <span className="text-sm font-black text-blue-700 uppercase tracking-widest">Seller Control</span>
                </div>
            </div>

            <ProductForm initialData={product} isEditing={true} productId={id} />
        </div>
    );
}
