import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, MapPin, Star, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { API_BASE } from '../lib/api';

interface GlobalProduct {
    id: number;
    name: string;
    category: string;
    image_url: string;
    description: string;
    rating?: number;
}

interface ProductDetail extends GlobalProduct {
    availability: {
        store_id: number;
        store_name: string;
        location: string;
        price: number;
        stock: number;
        rating: number; // NEW
        reviews: {
            user: string;
            stars: number;
            comment: string;
            date: number;
        }[];
    }[];
}

// Sub-component for individual store rows to handle partial state
// Sub-component for individual store rows to handle partial state
const StoreRow: React.FC<{ store: any, product: any, addToCart: any, onReviewSuccess: () => void }> = ({ store, product, addToCart, onReviewSuccess }) => {
    const [qty, setQty] = useState(1);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    const handleReview = async () => {
        if (!reviewText.trim()) return;
        setSubmitting(true);

        try {
            await fetch(`${API_BASE}/products/${product.id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: store.store_id, // Access store_id from prop
                    user_name: "Customer",
                    rating: reviewRating,
                    comment: reviewText
                })
            });
            setReviewText('');
            onReviewSuccess(); // Trigger refresh
        } catch (e) {
            console.error(e);
            alert("Failed to post review. Please try again.");
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div>
                    <div className="font-bold text-white text-lg">{store.store_name}</div>
                    <div className="text-xs text-neutral-400">{store.location}</div>
                    <div className="flex items-center gap-1 mt-1 text-amber-400 text-xs">
                        <Star size={12} fill="currentColor" />
                        <span>{store.rating} ({store.reviews.length} reviews)</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">${store.price.toFixed(2)}</div>
                    <div className={clsx("text-xs", store.stock < 10 ? "text-red-400" : "text-green-400")}>
                        {store.stock} in stock
                    </div>
                </div>
            </div>

            {/* Store Reviews Expansion */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="space-y-3 mb-4">
                    {store.reviews.length === 0 ? (
                        <div className="text-xs text-neutral-500 italic">No reviews yet. Be the first!</div>
                    ) : (
                        store.reviews.slice(0, 3).map((r: any, i: number) => (
                            <div key={i} className="text-xs text-neutral-400">
                                <span className="text-white font-bold">{r.user}: </span>
                                {r.comment}
                            </div>
                        ))
                    )}
                </div>

                {/* ADD TO CART & QUANTITY */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center bg-black/40 rounded-lg px-2 border border-white/10 h-10">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-white px-2 hover:text-blue-400 font-bold">-</button>
                        <span className="text-white text-xs w-6 text-center">{qty}</span>
                        <button onClick={() => setQty(Math.min(store.stock, qty + 1))} className="text-white px-2 hover:text-blue-400 font-bold">+</button>
                    </div>
                    <button
                        onClick={() => addToCart({ ...product, productId: product.id, id: String(product.id), stock: store.stock } as any, qty)}
                        className={clsx(
                            "flex-1 h-10 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg min-w-[140px]",
                            store.stock > 0
                                ? "bg-white text-black hover:bg-neutral-200"
                                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                        )}
                        disabled={store.stock <= 0}
                    >
                        {store.stock > 0 ? (
                            <>
                                <ShoppingBag size={14} /> Add to Cart (${(store.price * qty).toFixed(2)})
                            </>
                        ) : "Out of Stock"}
                    </button>
                </div>

                {/* Write Review Inline */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white h-10 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder={`Review ${store.store_name}...`}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReview()}
                    />
                    <div className="flex gap-2">
                        <select
                            className="bg-black/40 border border-white/10 rounded-lg px-2 text-xs text-amber-400 h-10 focus:border-blue-500 focus:outline-none"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                        >
                            <option value={5}>⭐⭐⭐⭐⭐</option>
                            <option value={4}>⭐⭐⭐⭐</option>
                            <option value={3}>⭐⭐⭐</option>
                            <option value={2}>⭐⭐</option>
                            <option value={1}>⭐</option>
                        </select>
                        <button
                            onClick={handleReview}
                            disabled={submitting || !reviewText.trim()}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-xs font-bold h-10 transition-all min-w-[60px]",
                                submitting || !reviewText.trim()
                                    ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                            )}
                        >
                            {submitting ? '...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CustomerShop: React.FC = () => {
    const { addToCart, cart, checkout } = useStore();
    const [products, setProducts] = useState<GlobalProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    useEffect(() => {
        fetch(`${API_BASE}/products/global`)
            .then(res => res.json())
            .then(data => setProducts(data));
    }, []);

    const fetchDetails = async (id: number) => {
        const res = await fetch(`${API_BASE}/products/global/${id}`);
        const data = await res.json();
        setSelectedProduct(data);
    };
};

const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
});

return (
    <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Global Catalog
                </h1>
                <p className="text-neutral-400 mt-2">Find the best prices near you.</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative group flex-1 md:w-64">
                    <Search className="absolute left-3 top-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </header>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={clsx(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                        categoryFilter === cat
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                            : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filtered.map((product) => (
                <motion.div
                    key={product.id}
                    layoutId={`prod-${product.id}`}
                    onClick={() => fetchDetails(product.id)}
                    whileHover={{ y: -5 }}
                    className="group bg-black/20 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all relative"
                >
                    <div className="aspect-square relative overflow-hidden">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                        <div className="absolute bottom-3 left-3 right-3">
                            <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded backdrop-blur-md">
                                {product.category}
                            </span>
                            <h3 className="text-lg font-bold mt-1 text-white leading-tight">{product.name}</h3>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Product Modal */}
        <AnimatePresence>
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProduct(null)} // Close on bg click
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        layoutId={`prod-${selectedProduct.id}`}
                        className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl shadow-blue-900/20"
                    >
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-white/20 transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        {/* Left: Image & Info */}
                        <div className="md:w-1/2 relative h-64 md:h-full">
                            <img src={selectedProduct.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent md:bg-gradient-to-r" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h2 className="text-4xl font-bold">{selectedProduct.name}</h2>
                                <div className='flex items-center gap-2 mt-2 mb-2'>
                                    <div className='flex text-amber-400'>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Math.round(selectedProduct.rating || 0) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-neutral-400">({selectedProduct.rating} / 5)</span>
                                </div>
                                <p className="text-neutral-300 text-sm">{selectedProduct.description}</p>
                            </div>
                        </div>

                        {/* Right: Availability & Reviews */}
                        <div className="md:w-1/2 p-6 overflow-y-auto space-y-8 bg-neutral-900">

                            {/* Availability & Reviews Section */}
                            <section>
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <MapPin size={14} /> Available At (Click to Review)
                                </h4>

                                <div className="space-y-4">
                                    {selectedProduct.availability.map((store, idx) => (
                                        <StoreRow
                                            key={idx}
                                            store={store}
                                            product={selectedProduct}
                                            addToCart={addToCart}
                                            onReviewSuccess={() => fetchDetails(selectedProduct.id)}
                                        />
                                    ))}

                                    {selectedProduct.availability.length === 0 && (
                                        <div className="text-center text-neutral-500 py-8">
                                            Out of stock everywhere.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Shopping Cart Drawer (Floating) */}
        <div className="fixed bottom-6 right-6 z-40">
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="bg-emerald-500 text-black font-bold px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-emerald-400 transition-colors shadow-emerald-500/20"
                        onClick={checkout}
                    >
                        <div className="relative">
                            <ShoppingBag className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-emerald-500">
                                {cart.reduce((acc, item) => acc + item.qty, 0)}
                            </span>
                        </div>
                        <span className="text-base">Checkout (${cart.reduce((acc, item: any) => acc + (item.price || 10) * item.qty, 0).toFixed(2)})</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    </div>
);
};
