import { create } from 'zustand';
import { API_BASE } from '../lib/api';

export type Role = 'customer' | 'retailer' | 'supplier' | 'warehouse';

export interface Product {
    id: string;
    productId: number;
    name: string;
    price: number;
    stock: number;
    image: string;
    category: string;
    minStockThreshold: number; // For auto-restock trigger
}

export interface Supplier {
    id: string;
    name: string;
    reliability: number; // 0-100%
    deliveryDays: number;
}

export interface AnalyticsData {
    name: string;
    sales: number;
    demand: number;
}

export interface Recommendation {
    item: string;
    reason: string;
}

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'stormy';

export interface AgentMessage {
    id: string;
    from: Role;
    to: Role;
    content: string;
    timestamp: number;
    type: 'info' | 'warning' | 'success';
}

interface AppState {
    // Auth State
    userRole: 'guest' | 'retailer' | 'supplier' | 'customer' | null;
    storeId: number | null;
    storeName: string | null;
    supplierId: number | null;
    supplierName: string | null;
    login: (role: 'guest' | 'retailer' | 'supplier' | 'customer', id?: number, name?: string) => void;
    logout: () => void;

    // Data State
    currentUser: Role | null; // Keeping for compatibility
    inventory: Product[];
    agentMessages: AgentMessage[];
    weather: WeatherType;
    recommendation: Recommendation | null;
    analyticsData: AnalyticsData[];
    suppliers: Supplier[];

    // Actions
    setUser: (role: Role | null) => void;
    updateStock: (productId: string, amount: number) => void;
    addAgentMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
    setWeather: (w: WeatherType) => void;
    fetchInitialData: () => Promise<void>;

    // New Agent Action
    restockLogs: string[];
    notifications: any[];
    runRestockAgent: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    approveOrder: (orderId: number) => Promise<void>;
    rejectOrder: (orderId: number) => Promise<void>;

    // Cart
    cart: (Product & { qty: number })[];
    addToCart: (product: Product, qty: number) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    checkout: () => Promise<void>;

    // Supplier
    supplierData: any;
    fetchSupplierData: () => Promise<void>;
    updateOrderStatus: (orderId: number, status: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    userRole: null,
    storeId: 1,
    storeName: 'Kiosk Alpha',
    supplierId: null,
    supplierName: null,
    currentUser: null,

    login: (role, id = 1, name = '') => {
        if (role === 'retailer') {
            set({ userRole: role, storeId: id, storeName: name, supplierId: null, supplierName: null });
        } else if (role === 'supplier') {
            set({ userRole: role, supplierId: id, supplierName: name, storeId: null, storeName: null });
        } else {
            set({ userRole: role });
        }

        // Only fetch retailer data if retailer
        if (role === 'retailer') {
            get().fetchInitialData();
        }
    },
    logout: () => set({ userRole: null, storeId: null, storeName: null, supplierId: null, supplierName: null }),

    inventory: [],
    agentMessages: [],
    weather: 'sunny',
    recommendation: null,
    analyticsData: [],
    suppliers: [
        { id: 's1', name: 'Global Foods Inc', reliability: 98, deliveryDays: 2 },
        { id: 's2', name: 'Local Farms Co', reliability: 85, deliveryDays: 1 },
    ],

    setUser: (role) => set({ userRole: role as any }),
    setWeather: (weather) => set({ weather }),

    fetchInitialData: async () => {
        const { storeId } = get();
        try {
            // Fetch Products for current store
            // Convert legacy storeId to query param
            const sId = storeId || 1;
            console.log("Fetching from:", `${API_BASE}/products?store_id=${sId}`); // DEBUG LOG
            const pRes = await fetch(`${API_BASE}/products?store_id=${sId}`);
            const products = await pRes.json();

            // Map Backend snake_case to Frontend camelCase
            const inventory = products.map((p: any) => ({
                id: p.id.toString(),
                productId: p.product_id, // Link to Global Product
                name: p.name,
                price: p.price,
                stock: p.stock,
                image: p.image_url,
                category: p.category,
                minStockThreshold: p.min_stock_threshold
            }));

            // Fetch Weather
            const wRes = await fetch(`${API_BASE}/weather`);
            const wData = await wRes.json();

            // Fetch Analytics
            const aRes = await fetch(`${API_BASE}/analytics/dashboard?store_id=${sId}`);
            const aData = await aRes.json();

            set({
                inventory,
                weather: wData.condition,
                recommendation: wData.recommendation,
                analyticsData: aData
            });
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            // Don't break UI if analytics fails
        }
    },

    updateStock: (productId, amount) => set((state) => ({
        inventory: state.inventory.map(p =>
            p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p
        )
    })),

    addAgentMessage: (msg) => set((state) => ({
        agentMessages: [
            { ...msg, id: Math.random().toString(), timestamp: Date.now() },
            ...state.agentMessages
        ].slice(0, 50)
    })),

    restockLogs: [],
    runRestockAgent: async () => {
        const { storeId } = get();
        try {
            const res = await fetch(`${API_BASE}/agent/run-restock?store_id=${storeId || 1}`, { method: 'POST' });
            const data = await res.json();

            // Add logs to state
            set((state) => ({
                restockLogs: [...data.logs, ...state.restockLogs]
            }));

            // Refresh Inventory to show new stock (if any)
            get().fetchInitialData();

        } catch (e) {
            console.error("Agent failed", e);
        }
    },

    notifications: [],
    fetchNotifications: async () => {
        const { storeId } = get();
        try {
            const res = await fetch(`${API_BASE}/agent/notifications?store_id=${storeId || 1}`);
            const data = await res.json();
            set({ notifications: data });
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    },

    approveOrder: async (orderId: number) => {
        try {
            await fetch(`${API_BASE}/agent/approve/${orderId}`, { method: 'POST' });
            // Refresh
            await get().fetchNotifications();
            await get().fetchInitialData(); // Update stock/orders
        } catch (e) {
            console.error("Failed to approve", e);
        }
    },

    rejectOrder: async (orderId: number) => {
        try {
            await fetch(`${API_BASE}/agent/reject/${orderId}`, { method: 'POST' });
            // Refresh
            await get().fetchNotifications();
        } catch (e) {
            console.error("Failed to reject", e);
        }
    },

    // --- Cart & Checkout ---
    cart: [],
    addToCart: (product, qty) => set((state) => {
        const existing = state.cart.find(i => i.productId === product.productId);
        if (existing) {
            return {
                cart: state.cart.map(i =>
                    i.productId === product.productId ? { ...i, qty: i.qty + qty } : i
                )
            };
        }
        return { cart: [...state.cart, { ...product, qty }] };
    }),
    removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(i => i.productId !== productId)
    })),
    clearCart: () => set({ cart: [] }),
    checkout: async () => {
        const { cart, storeId, fetchInitialData } = get();
        if (cart.length === 0) return;

        try {
            await fetch(`${API_BASE}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: storeId || 1,
                    items: cart.map(i => ({ product_id: i.productId, quantity: i.qty }))
                })
            });
            set({ cart: [] });
            // Refresh Inventory immediately to see stock drop
            fetchInitialData();
        } catch (e) {
            console.error("Checkout failed", e);
        }
    },

    // --- Supplier Portal Actions ---
    supplierData: null,
    fetchSupplierData: async () => {
        const { supplierId } = get();
        if (!supplierId) return;
        try {
            const res = await fetch(`${API_BASE}/suppliers/${supplierId}/dashboard`);
            const data = await res.json();
            set({ supplierData: data });
        } catch (e) {
            console.error("Failed to load supplier", e);
        }
    },
    updateOrderStatus: async (orderId: number, status: string) => {
        try {
            await fetch(`${API_BASE}/suppliers/orders/${orderId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            get().fetchSupplierData(); // Refresh list
        } catch (e) {
            console.error("Update failed", e);
        }
    }
}));
