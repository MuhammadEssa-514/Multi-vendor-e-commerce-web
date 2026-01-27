import Link from "next/link";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import { Star, Heart, Share2, MapPin, Truck, ShieldCheck, Undo2, BadgePercent, LayoutGrid, Store } from "lucide-react";
import ProductCard from "@/components/product-card";
import AddToCartButton from "@/app/products/[id]/add-to-cart-button";
import ReviewSection from "@/components/ReviewSection";
import GalleryView from "./GalleryView";
import WishlistButton from "@/components/WishlistButton";
import { Metadata } from "next";

async function getProduct(id: string) {
    await dbConnect();
    try {
        const product = await Product.findById(id).populate("sellerId", "storeName").lean();
        if (!product) return null;

        const plainAttributes = product.attributes instanceof Map
            ? Object.fromEntries(product.attributes)
            : product.attributes || {};

        return {
            ...product,
            _id: product._id.toString(),
            sellerId: product.sellerId ? { ...product.sellerId, _id: product.sellerId._id.toString() } : null,
            createdAt: product.createdAt.toString(),
            updatedAt: product.updatedAt.toString(),
            attributes: plainAttributes
        };
    } catch (e) {
        return null;
    }
}

async function getRelatedProducts(category: string, currentProductId: string) {
    await dbConnect();
    const products = await Product.find({
        category,
        _id: { $ne: currentProductId }
    })
        .limit(6)
        .lean();

    return products.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        discount: p.onSale && p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0,
        rating: 4.5 + (Math.random() * 0.5), // Mock rating for professional feel
        reviews: Math.floor(Math.random() * 200) + 20 // Mock reviews
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: "Product Not Found | Daraz 514",
            description: "The product you are looking for is not available."
        };
    }

    const price = product.onSale && product.salePrice ? product.salePrice : product.price;
    const imageUrl = product.images?.[0] || "/placeholder-product.jpg";

    return {
        title: `${product.name} | Buy Online at Best Price | Daraz 514`,
        description: product.description.slice(0, 160) + "...",
        keywords: [product.category, product.name, "buy online pakistan", "daraz 514"],
        openGraph: {
            title: product.name,
            description: product.description.slice(0, 200),
            url: `https://daraz514.com/products/${id}`,
            siteName: "Daraz 514",
            images: [{
                url: imageUrl,
                width: 800,
                height: 800,
                alt: product.name
            }],
            locale: "en_PK",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description.slice(0, 200),
            images: [imageUrl],
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category, id);
    const discountPercent = product.onSale && product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-[#fafafa] pb-24">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": product.name,
                        "image": product.images || [],
                        "description": product.description,
                        "brand": {
                            "@type": "Brand",
                            "name": product.sellerId?.storeName || "Daraz 514"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": `https://daraz514.com/products/${id}`,
                            "priceCurrency": "PKR",
                            "price": product.onSale && product.salePrice ? product.salePrice : product.price,
                            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                            "itemCondition": "https://schema.org/NewCondition",
                            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                            "seller": {
                                "@type": "Organization",
                                "name": product.sellerId?.storeName || "Daraz 514"
                            }
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "reviewCount": "124"
                        }
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://daraz514.com"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": product.category,
                                "item": `https://daraz514.com/products?category=${product.category}`
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": product.name,
                                "item": `https://daraz514.com/products/${id}`
                            }
                        ]
                    })
                }}
            />

            {/* Breadcrumb - Minimal & Clean */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-4 text-[11px] flex items-center gap-2 font-semibold uppercase tracking-wider text-gray-400">
                    <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
                    <span className="opacity-30">/</span>
                    <Link href="/products" className="hover:text-gray-900 transition-colors">{product.category}</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-gray-800 truncate max-w-[200px] sm:max-w-none font-bold italic">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Left Column: Media & Core Info */}
                <div className="xl:col-span-9 space-y-10">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-12 shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                            {/* Image Component */}
                            <div className="lg:col-span-12 xl:col-span-5">
                                <GalleryView images={product.images || []} name={product.name} />

                                <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-blue-50/50 p-4 sm:p-5 rounded-3xl flex items-center gap-3 border border-blue-100/50">
                                        <Truck className="text-blue-600 flex-shrink-0" size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Fast Shipping</span>
                                    </div>
                                    <div className="bg-green-50/50 p-4 sm:p-5 rounded-3xl flex items-center gap-3 border border-green-100/50">
                                        <ShieldCheck className="text-green-600 flex-shrink-0" size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">Verified Quality</span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Info Overhaul - Less Bold, More Premium */}
                            <div className="lg:col-span-12 xl:col-span-7 flex flex-col">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-gray-200">
                                            {product.category}
                                        </span>
                                        {product.onSale && (
                                            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 border border-rose-100">
                                                <BadgePercent size={14} />
                                                Flash Deal
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
                                        {product.name}
                                    </h1>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10">
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "text-yellow-400" : "text-gray-200"} />
                                                ))}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500">4.8 (124 Reviews)</span>
                                        </div>

                                        <div className="hidden sm:block h-4 w-px bg-gray-200"></div>

                                        <div className="flex items-center gap-5">
                                            <WishlistButton productId={product._id} />
                                            <button className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group">
                                                <Share2 size={16} className="group-hover:scale-110 transition-transform" /> Share
                                            </button>
                                        </div>
                                    </div>

                                    {/* Pricing Block - Refined */}
                                    <div className="mb-10 p-1 border-b border-gray-100 pb-10">
                                        {product.onSale && product.salePrice ? (
                                            <div className="space-y-1">
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-4xl font-black text-gray-900 tracking-tighter">
                                                        ₨ {product.salePrice.toLocaleString()}
                                                    </span>
                                                    <span className="text-base font-semibold text-gray-400 line-through">
                                                        ₨ {product.price.toLocaleString()}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black rounded-md">
                                                        -{discountPercent}%
                                                    </span>
                                                </div>
                                                <p className="text-rose-500 font-bold text-xs uppercase tracking-widest">
                                                    Special promotion price
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-4xl font-black text-gray-900 tracking-tighter">
                                                ₨ {product.price.toLocaleString()}
                                            </div>
                                        )}

                                        <div className="mt-6 flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 text-[10px] font-bold uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                {product.stock > 0 ? "In Stock & Ready to ship" : "Stock unavailable"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <AddToCartButton product={product} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specifications - Grid Layout */}
                    {Object.keys(product.attributes || {}).length > 0 && (
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-gray-900 rounded-2xl text-white">
                                    <LayoutGrid size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Technical Specifications</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(product.attributes).map(([key, value]) => (
                                    <div key={key} className="space-y-1.5 group">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{key.replace(/_/g, ' ')}</span>
                                        <p className="font-bold text-gray-800 text-[13px] bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                            {Array.isArray(value) ? value.join(', ') : String(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Description */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <BadgePercent size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Product Description</h2>
                        </div>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium text-base sm:text-lg px-2 max-w-4xl">
                            {product.description}
                        </div>
                    </div>
                </div>

                {/* Right Column: Experience Sidebar - Cleaner Grid */}
                <div className="xl:col-span-3 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-24">
                        <div className="space-y-10">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-gray-50 text-gray-500 rounded-xl">
                                        <MapPin size={20} />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900">Delivery Details</h4>
                                </div>
                                <div className="pl-1 space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Shipping Destination</p>
                                        <p className="text-sm font-bold text-gray-800 mt-1">Nationwide (Pakistan)</p>
                                    </div>
                                    <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Select Location</button>
                                </div>
                            </section>

                            <div className="h-px bg-gray-50"></div>

                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-gray-50 text-gray-500 rounded-xl">
                                        <Undo2 size={20} />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900">After-Sales Policy</h4>
                                </div>
                                <div className="pl-1 space-y-1">
                                    <p className="text-sm font-bold text-gray-800 italic">7 Days Return Guarantee</p>
                                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">Easy returns if the product matches return criteria</p>
                                </div>
                            </section>

                            <div className="pt-10 border-t border-gray-50">
                                <div className="flex items-center gap-2 mb-6 opacity-40">
                                    <Store size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Licensed Seller</span>
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 italic">
                                        {product.sellerId?.storeName?.[0] || 'S'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-base font-black text-gray-900 truncate">{product.sellerId?.storeName || "Official Store"}</div>
                                        <Link href="#" className="text-[9px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View Store Profile</Link>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                                        <div className="text-sm font-black text-gray-900">98%</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Success</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                                        <div className="text-sm font-black text-gray-900">Fast</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Reply</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Ratings & Reviews Section */}
            <div className="max-w-7xl mx-auto px-4 mt-20">
                <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-yellow-400 rounded-2xl text-white shadow-lg shadow-yellow-100">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Feedback</h2>
                    </div>
                    <ReviewSection productId={id} />
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 mt-20">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-xl shadow-gray-200">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">You Might Also Like</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-0.5 opacity-60">Handpicked for your style</p>
                            </div>
                        </div>
                        <Link href="/products" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline bg-blue-50 px-4 py-2 rounded-xl transition-all">Explore All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8">
                        {relatedProducts.map((p: any) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
