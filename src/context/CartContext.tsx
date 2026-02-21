"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

type CartItem = {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    quantity: number;
    sellerId: string;
    stock: number;
    [key: string]: any;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (product: any, quantity?: number) => void;
    buyNow: (product: any, quantity?: number) => void;
    directCheckoutItem: CartItem | null;
    clearDirectCheckout: () => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

    const isInitialMount = useRef(true);
    const syncTimeout = useRef<NodeJS.Timeout | null>(null);

    // 1. Initial Load & Merge Logic
    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);

            const savedLocalCart = localStorage.getItem("cart");
            let localItems: CartItem[] = [];
            if (savedLocalCart) {
                try {
                    localItems = JSON.parse(savedLocalCart);
                } catch (e) { }
            }

            // Sync/Merge if logged in
            if (status === "authenticated" && session?.user) {
                try {
                    const res = await fetch("/api/cart");
                    const data = await res.json();
                    const dbItems: CartItem[] = data.items || [];

                    // Always prioritize DB items, but merge if there are local items
                    let finalCart = [...dbItems];

                    if (localItems.length > 0) {
                        localItems.forEach(localItem => {
                            const localId = localItem._id?.toString();
                            if (!localId) return;

                            const index = finalCart.findIndex(item => item._id?.toString() === localId);
                            if (index > -1) {
                                finalCart[index].quantity = Number(finalCart[index].quantity) + Number(localItem.quantity);
                            } else {
                                finalCart.push({ ...localItem, quantity: Number(localItem.quantity) });
                            }
                        });

                        // Immediately clear localStorage to prevent multiple merges
                        localStorage.removeItem("cart");

                        // Sync merged result back to DB
                        await fetch("/api/cart", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ items: finalCart }),
                        });
                    }

                    setCart(finalCart);
                    setLoading(false);
                    return;
                } catch (e) {
                    console.error("Failed to load/merge DB cart", e);
                }
            }

            // Fallback: LocalStorage only
            setCart(localItems);

            // RESTORE DIRECT CHECKOUT ITEM (Buy Now)
            const savedDirect = sessionStorage.getItem("direct_checkout_item");
            if (savedDirect) {
                try {
                    setDirectCheckoutItem(JSON.parse(savedDirect));
                } catch (e) { }
            }

            setLoading(false);
        };

        if (status !== 'loading') {
            loadCart();
        }
    }, [status]);

    // 2. Debounced Sync to DB & LocalStorage
    const syncCart = useCallback(async (currentCart: CartItem[]) => {
        // Sync to DB if logged in
        if (status === "authenticated") {
            try {
                // Remove from local storage immediately to prevent doubling on next login
                localStorage.removeItem("cart");

                await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: currentCart }),
                });
            } catch (e) {
                console.error("Sync to DB failed", e);
            }
        } else if (status === "unauthenticated") {
            // ONLY save to LocalStorage for guests
            localStorage.setItem("cart", JSON.stringify(currentCart));
        }
    }, [status]);

    // Trigger sync whenever cart changes (after initial load is complete)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (syncTimeout.current) clearTimeout(syncTimeout.current);

        syncTimeout.current = setTimeout(() => {
            // Self-healing deduplication before sync
            const uniqueCartMap = new Map();
            cart.forEach(item => {
                const id = item._id?.toString();
                if (!id) return;
                if (uniqueCartMap.has(id)) {
                    // Combine quantities if duplicate found
                    const existing = uniqueCartMap.get(id);
                    uniqueCartMap.set(id, {
                        ...existing,
                        quantity: Number(existing.quantity) + Number(item.quantity)
                    });
                } else {
                    uniqueCartMap.set(id, { ...item });
                }
            });
            const uniqueCart = Array.from(uniqueCartMap.values());

            // Only update state if duplicates were found (prevents infinite loop)
            if (uniqueCart.length !== cart.length) {
                setCart(uniqueCart);
            }

            syncCart(uniqueCart);
        }, 1000);

        return () => {
            if (syncTimeout.current) clearTimeout(syncTimeout.current);
        };
    }, [cart, syncCart]);

    const addToCart = (product: any, quantity: number = 1) => {
        if (!product?._id) return;

        setCart((prevCart) => {
            const productIds = product._id.toString();
            const existingItemIndex = prevCart.findIndex((item) => item._id?.toString() === productIds);

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: Number(newCart[existingItemIndex].quantity) + Number(quantity)
                };
                return newCart;
            } else {
                return [...prevCart, { ...product, _id: productIds, quantity: Number(quantity) }];
            }
        });
    };

    const buyNow = (product: any, quantity: number = 1) => {
        const item = { ...product, quantity: Number(quantity) };
        setDirectCheckoutItem(item);
        sessionStorage.setItem("direct_checkout_item", JSON.stringify(item));
    };

    const clearDirectCheckout = () => {
        setDirectCheckoutItem(null);
        sessionStorage.removeItem("direct_checkout_item");
    }

    const removeFromCart = (productId: string) => {
        const targetId = productId.toString();
        setCart((prevCart) => prevCart.filter((item) => item._id?.toString() !== targetId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        const targetId = productId.toString();
        const numericQuantity = Number(quantity);
        if (numericQuantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) => (item._id?.toString() === targetId ? { ...item, quantity: numericQuantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
        if (status === "authenticated") {
            syncCart([]); // Clear DB cart too
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + Number(item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, buyNow, directCheckoutItem, clearDirectCheckout, loading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
