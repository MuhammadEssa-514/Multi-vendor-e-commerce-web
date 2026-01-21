import ProductCard from "@/components/product-card";
import FilterSidebar from "@/components/FilterSidebar";
import { Search } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

async function getProducts(params: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
}) {
    await dbConnect();

    let query: any = {};

    if (params.search) {
        const searchTerms = params.search.trim().split(/\s+/);

        // Create an array of conditions where EACH term must match at least one field
        const termConditions = searchTerms.map(term => {
            const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(safeTerm, "i");
            return {
                $or: [
                    { name: { $regex: regex } },
                    { description: { $regex: regex } },
                    { tags: { $regex: regex } }
                ]
            };
        });

        query.$and = termConditions;
    }

    if (params.category && params.category !== "All") {
        query.category = params.category;
    }

    if (params.minPrice || params.maxPrice) {
        query.price = {};
        if (params.minPrice) query.price.$gte = Number(params.minPrice);
        if (params.maxPrice) query.price.$lte = Number(params.maxPrice);
    }

    let sortOptions: any = { createdAt: -1 };
    if (params.sort === "price_low") sortOptions = { price: 1 };
    if (params.sort === "price_high") sortOptions = { price: -1 };
    if (params.sort === "trending") sortOptions = { rating: -1 };

    const products = await Product.find(query)
        .sort(sortOptions)
        .populate("sellerId", "storeName")
        .lean();

    return products.map((product: any) => ({
        ...product,
        _id: product._id.toString(),
        sellerId: product.sellerId ? { ...product.sellerId, _id: product.sellerId._id.toString() } : null,
        createdAt: product.createdAt.toString(),
        updatedAt: product.updatedAt.toString(),
        discount: product.discount || Math.floor(Math.random() * 30) + 5,
        rating: product.rating || 4.5,
        reviews: product.reviews || Math.floor(Math.random() * 100),
    }));
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<any> }) {
    const resolvedParams = await searchParams;
    const products = await getProducts(resolvedParams);
    const isFiltered = Object.keys(resolvedParams).length > 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">

                {/* Sidebar */}
                <FilterSidebar />

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {resolvedParams.search ? `Results for "${resolvedParams.search}"` : "Explore Products"}
                        </h1>
                        <span className="text-sm text-gray-500 font-medium">{products.length} products found</span>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map((product: any) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-sm text-center shadow-sm border border-gray-100 mt-4">
                            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <Link href="/products" className="text-blue-600 font-bold hover:underline">Clear all filters</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
