import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/product-card";
import Link from "next/link";
import HeroSlider from "@/components/hero-slider";
import "@/models/User";
import FilterSidebar from "@/components/FilterSidebar";
import { Crown } from "lucide-react";

async function getProducts(params: {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  search?: string;
}) {
  await dbConnect();

  let query: any = {};

  if (params.category && params.category !== "All") {
    query.category = params.category;
  }

  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) query.price.$gte = Number(params.minPrice);
    if (params.maxPrice) query.price.$lte = Number(params.maxPrice);
  }

  if (params.search) {
    query.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { description: { $regex: params.search, $options: "i" } }
    ];
  }

  let sortOptions: any = { createdAt: -1 };
  if (params.sort === "price_low") sortOptions = { price: 1 };
  if (params.sort === "price_high") sortOptions = { price: -1 };
  if (params.sort === "trending") sortOptions = { rating: -1 };

  const products = await Product.find(query)
    .sort(sortOptions)
    .limit(24)
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

async function getFeaturedProducts() {
  await dbConnect();
  const now = new Date();
  const products = await Product.find({
    isFeatured: true,
    featuredExpiresAt: { $gt: now }
  })
    .sort({ featuredExpiresAt: 1 })
    .limit(4)
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

export default async function Home({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;
  const products = await getProducts(resolvedParams);
  const featuredProducts = await getFeaturedProducts();
  const isFiltered = Object.keys(resolvedParams).length > 0;

  return (
    <main className="min-h-screen bg-gray-50">

      {!isFiltered && (
        <div className="max-w-7xl mx-auto px-4 mt-4 space-y-8">
          <HeroSlider />

          {/* Featured / Premium Section */}
          {featuredProducts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500 rounded-lg text-white shadow-lg shadow-amber-200">
                  <Crown size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Premium Collection</h2>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Handpicked Top Sellers</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product: any) => (
                  <div key={product._id} className="relative group">
                    <div className="absolute -top-3 -right-2 z-10 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm transform rotate-3 flex items-center gap-1">
                      <Crown size={10} fill="currentColor" /> Featured
                    </div>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-6 pb-12">
        {/* Sidebar */}
        <FilterSidebar />

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
              {isFiltered ? "Search Results" : "Just For You"}
            </h3>
            {isFiltered && <span className="text-sm text-gray-500">{products.length} products found</span>}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-sm text-center shadow-sm">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block font-medium">Clear all filters</Link>
            </div>
          )}

          {!isFiltered && products.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/products" className="inline-block border-2 border-blue-600 text-blue-600 px-10 py-2.5 font-bold text-sm uppercase hover:bg-blue-50 transition rounded-sm">
                Load More
              </Link>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}
