"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2, Plus, ImageIcon, Sparkles, Tag, DollarSign, Clock, Smartphone, Home, Shirt, Dumbbell, Car, Wrench, BookOpen, Gamepad2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const CATEGORIES = [
    { name: "Electronics", icon: <Sparkles size={16} /> },
    { name: "Mobiles & Tablets", icon: <Smartphone size={16} /> },
    { name: "Fashion", icon: <Shirt size={16} /> },
    { name: "Home & Living", icon: <Home size={16} /> },
    { name: "Beauty & Health", icon: <Sparkles size={16} /> },
    { name: "Toys & Hobbies", icon: <Gamepad2 size={16} /> },
    { name: "Sports & Outdoors", icon: <Dumbbell size={16} /> },
    { name: "Automotive", icon: <Car size={16} /> },
    { name: "Tools & Industrial", icon: <Wrench size={16} /> },
    { name: "Books & Stationery", icon: <BookOpen size={16} /> },
];

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
    productId?: string;
}

export default function ProductForm({ initialData, isEditing, productId }: ProductFormProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageGallery, setImageGallery] = useState<string[]>(initialData?.images || []);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price || "",
        salePrice: initialData?.salePrice || "",
        onSale: initialData?.salePrice ? true : false,
        category: initialData?.category || "",
        stock: initialData?.stock || "",
        tags: initialData?.tags?.join(", ") || "",
    });

    const [attributes, setAttributes] = useState<Record<string, any>>(initialData?.attributes || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? (e.target as any).checked : value
        });
    };

    const handleAttributeChange = (name: string, value: any) => {
        setAttributes({ ...attributes, [name]: value });
    };

    const [imageUrlInput, setImageUrlInput] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const data = new FormData();
            data.append("file", files[i]);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: data,
                });
                if (!res.ok) throw new Error("Upload failed");
                const result = await res.json();
                uploadedUrls.push(result.url);
            } catch (err) {
                console.error("Upload error:", err);
                showToast("Failed to upload image", "error");
            }
        }

        setImageGallery([...imageGallery, ...uploadedUrls]);
        setUploading(false);
    };

    const handleAddImage = () => {
        if (!imageUrlInput.trim()) return;
        setImageGallery([...imageGallery, imageUrlInput.trim()]);
        setImageUrlInput("");
    };

    const removeImage = (index: number) => {
        setImageGallery(imageGallery.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name || !formData.price || !formData.category) {
                showToast("Please fill all required fields", "error");
                setLoading(false);
                return;
            }

            const url = isEditing ? `/api/products/${productId}` : "/api/products";
            const method = isEditing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    salePrice: formData.onSale && formData.salePrice ? Number(formData.salePrice) : null,
                    stock: Number(formData.stock),
                    tags: formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()) : [],
                    images: imageGallery,
                    attributes: attributes
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save product");
            }

            showToast(isEditing ? "Product updated successfully!" : "Product published successfully!", "success");
            router.push("/dashboard/seller/products");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Basic Info & Attributes */}
            <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <ImageIcon size={20} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900">General Details</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Product Title</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. iPhone 15 Pro Max 256GB Titanium"
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
                            <textarea
                                name="description"
                                rows={5}
                                required
                                placeholder="Write a compelling description for your customers..."
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-700 leading-relaxed"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Category</label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-black text-gray-700 appearance-none pointer-events-auto"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Stock Units</label>
                                <input
                                    type="number"
                                    name="stock"
                                    required
                                    placeholder="Quantity"
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-black text-gray-900"
                                    value={formData.stock}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dynamic Attributes Section */}
                {formData.category && (
                    <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-500 rounded-xl text-white">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900">{formData.category} Specifications</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Mobiles & Tablets */}
                            {formData.category === "Mobiles & Tablets" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Brand</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.brand || ""}
                                            onChange={(e) => handleAttributeChange("brand", e.target.value)}
                                        >
                                            <option value="">Select Brand</option>
                                            <option value="Apple">Apple</option>
                                            <option value="Samsung">Samsung</option>
                                            <option value="Xiaomi">Xiaomi</option>
                                            <option value="Infinix">Infinix</option>
                                            <option value="Tecno">Tecno</option>
                                            <option value="Realme">Realme</option>
                                            <option value="Oppo">Oppo</option>
                                            <option value="Vivo">Vivo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Model</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. iPhone 15 Pro"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.model || ""}
                                            onChange={(e) => handleAttributeChange("model", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Color Options (comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Titanium, Black, Blue"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.colors?.join(", ") || ""}
                                            onChange={(e) => handleAttributeChange("colors", e.target.value.split(",").map(c => c.trim()))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Storage (ROM)</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.storage || ""}
                                            onChange={(e) => handleAttributeChange("storage", e.target.value)}
                                        >
                                            <option value="">Select Storage</option>
                                            <option value="64GB">64GB</option>
                                            <option value="128GB">128GB</option>
                                            <option value="256GB">256GB</option>
                                            <option value="512GB">512GB</option>
                                            <option value="1TB">1TB</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Memory (RAM)</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.ram || ""}
                                            onChange={(e) => handleAttributeChange("ram", e.target.value)}
                                        >
                                            <option value="">Select RAM</option>
                                            <option value="4GB">4GB</option>
                                            <option value="6GB">6GB</option>
                                            <option value="8GB">8GB</option>
                                            <option value="12GB">12GB</option>
                                            <option value="16GB">16GB</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">PTA Approved?</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.pta || ""}
                                            onChange={(e) => handleAttributeChange("pta", e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Fashion */}
                            {formData.category === "Fashion" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Gender</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.gender || ""}
                                            onChange={(e) => handleAttributeChange("gender", e.target.value)}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Men">Men</option>
                                            <option value="Women">Women</option>
                                            <option value="Kids">Kids</option>
                                            <option value="Unisex">Unisex</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Sizes (comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. S, M, L, XL"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.sizes?.join(", ") || ""}
                                            onChange={(e) => handleAttributeChange("sizes", e.target.value.split(",").map(s => s.trim()))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Colors (comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Red, Blue, Black"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.colors?.join(", ") || ""}
                                            onChange={(e) => handleAttributeChange("colors", e.target.value.split(",").map(c => c.trim()))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Material</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Cotton, Polyester"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.material || ""}
                                            onChange={(e) => handleAttributeChange("material", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Electronics (General) */}
                            {formData.category === "Electronics" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Brand</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Sony, LG"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.brand || ""}
                                            onChange={(e) => handleAttributeChange("brand", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Warranty Period</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.warranty || ""}
                                            onChange={(e) => handleAttributeChange("warranty", e.target.value)}
                                        >
                                            <option value="">Select Warranty</option>
                                            <option value="No Warranty">No Warranty</option>
                                            <option value="6 Months">6 Months</option>
                                            <option value="1 Year">1 Year</option>
                                            <option value="2 Years">2 Years</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Books & Stationery */}
                            {formData.category === "Books & Stationery" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Author / Brand</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. J.K. Rowling"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.author || ""}
                                            onChange={(e) => handleAttributeChange("author", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Language</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.language || ""}
                                            onChange={(e) => handleAttributeChange("language", e.target.value)}
                                        >
                                            <option value="">Select Language</option>
                                            <option value="English">English</option>
                                            <option value="Urdu">Urdu</option>
                                            <option value="Arabic">Arabic</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Automotive */}
                            {formData.category === "Automotive" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Compatible Brand</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Honda, Toyota"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.compatibleBrand || ""}
                                            onChange={(e) => handleAttributeChange("compatibleBrand", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Part Number (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. TY-1234"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.partNumber || ""}
                                            onChange={(e) => handleAttributeChange("partNumber", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Beauty & Health */}
                            {formData.category === "Beauty & Health" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Skin Type</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.skinType || ""}
                                            onChange={(e) => handleAttributeChange("skinType", e.target.value)}
                                        >
                                            <option value="">Select Skin Type</option>
                                            <option value="All Types">All Types</option>
                                            <option value="Dry">Dry</option>
                                            <option value="Oily">Oily</option>
                                            <option value="Sensitive">Sensitive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Volume / Weight</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 100ml"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.volume || ""}
                                            onChange={(e) => handleAttributeChange("volume", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Generic Fallback for other categories (Home, Toys, Tools, Sports) */}
                            {["Home & Living", "Toys & Hobbies", "Sports & Outdoors", "Tools & Industrial"].includes(formData.category) && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Brand / Manufacturer</label>
                                        <input
                                            type="text"
                                            placeholder="Brand Name"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.brand || ""}
                                            onChange={(e) => handleAttributeChange("brand", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Material</label>
                                        <input
                                            type="text"
                                            placeholder="Material Type"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.material || ""}
                                            onChange={(e) => handleAttributeChange("material", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Color (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Red, Multicolor"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.colors?.[0] || ""}
                                            onChange={(e) => handleAttributeChange("colors", [e.target.value])}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Weight / Dimensions</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 5kg, 10x10 inches"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                            value={attributes.dimensions || ""}
                                            onChange={(e) => handleAttributeChange("dimensions", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                        </div>
                    </section>
                )}
            </div>

            {/* Right Column: Pricing & Gallery */}
            <div className="space-y-8">
                {/* Media Gallery */}
                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Media Gallery</h3>
                        <span className="text-[10px] font-black text-gray-400">{imageGallery.length}/5</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {imageGallery.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm">
                                <Image
                                    src={url}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                    </div>

                    {imageGallery.length < 5 && (
                        <div className="space-y-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                            {/* Option 1: Upload File */}
                            <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all font-bold text-gray-600 text-xs shadow-sm group">
                                {uploading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Upload size={16} className="group-hover:scale-110 transition-transform" />
                                )}
                                <span>{uploading ? "Uploading..." : "Upload from Device"}</span>
                                <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={uploading} accept="image/*" />
                            </label>

                            <div className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">OR</div>

                            {/* Option 2: Paste URL */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Paste Image Link (https://...)"
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImage}
                                    className="bg-gray-900 text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition shadow-sm"
                                    title="Add Link"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                    <p className="text-[10px] text-gray-400 text-center font-bold px-4">Supported: JPG, PNG, WEBP (Max 5MB)</p>
                </section>

                {/* Pricing & Sales */}
                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Pricing Logic</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Regular Price (PKR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">₨</span>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    className="w-full pl-10 pr-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-gray-900"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-rose-500" />
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Active Sale?</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="onSale"
                                        className="sr-only peer"
                                        checked={formData.onSale}
                                        onChange={handleChange}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                </label>
                            </div>

                            {formData.onSale && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Discounted Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-black">₨</span>
                                        <input
                                            type="number"
                                            name="salePrice"
                                            className="w-full pl-10 pr-5 py-4 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-500 outline-none transition-all font-black text-rose-600"
                                            value={formData.salePrice}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-rose-400 font-bold px-1 italic">Customer will see the discounted price during checkout</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="space-y-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:bg-blue-700 transition shadow-2xl shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Syncing to Marketplace...</span>
                            </>
                        ) : (
                            <>
                                {isEditing ? <Sparkles size={18} /> : <Plus size={18} />}
                                <span className="uppercase tracking-[0.2em] text-xs">{isEditing ? "Update Product" : "Publish Product"}</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition"
                    >
                        Cancel and Discard
                    </button>
                </div>
            </div>
        </form>
    );
}
