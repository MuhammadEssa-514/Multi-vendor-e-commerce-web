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
    addToCart: (product: any) => void;
    buyNow: (product: any) => void;
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
            if (status === "authenticated") {
                try {
                    const res = await fetch("/api/cart");
                    const data = await res.json();
                    const dbItems: CartItem[] = data.items || [];

                    if (localItems.length > 0) {
                        // MERGE: Combine local items into DB items
                        const mergedCart = [...dbItems];
                        localItems.forEach(localItem => {
                            const index = mergedCart.findIndex(item => item._id === localItem._id);
                            if (index > -1) {
                                // Ensure numeric addition
                                mergedCart[index].quantity = Number(mergedCart[index].quantity) + Number(localItem.quantity);
                            } else {
                                mergedCart.push({ ...localItem, quantity: Number(localItem.quantity) });
                            }
                        });

                        setCart(mergedCart);
                        // Sync merged result back to DB immediately
                        await fetch("/api/cart", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ items: mergedCart }),
                        });
                        // Clear local storage to prevent double merge
                        localStorage.removeItem("cart");
                    } else {
                        setCart(dbItems);
                    }
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
        // Always save to LocalStorage as fallback for guests
        localStorage.setItem("cart", JSON.stringify(currentCart));

        // Sync to DB if logged in
        if (status === "authenticated") {
            try {
                await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: currentCart }),
                });
            } catch (e) {
                console.error("Sync to DB failed", e);
            }
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
            syncCart(cart);
        }, 1000); // 1-second debounce to stay efficient

        return () => {
            if (syncTimeout.current) clearTimeout(syncTimeout.current);
        };
    }, [cart, syncCart]);

    const addToCart = (product: any) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item._id === product._id);
            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity = Number(newCart[existingItemIndex].quantity) + 1;
                return newCart;
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const buyNow = (product: any) => {
        const item = { ...product, quantity: 1 };
        setDirectCheckoutItem(item);
        sessionStorage.setItem("direct_checkout_item", JSON.stringify(item));
    };

    const clearDirectCheckout = () => {
        setDirectCheckoutItem(null);
        sessionStorage.removeItem("direct_checkout_item");
    }

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        const numericQuantity = Number(quantity);
        if (numericQuantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) => (item._id === productId ? { ...item, quantity: numericQuantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
        if (status === "authenticated") {
            syncCart([]); // Clear DB cart too
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
