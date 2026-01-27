import { create } from 'zustand';

export type Role = 'customer' | 'retailer' | 'supplier' | 'warehouse';

export interface Product {
    id: string;
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
    currentUser: Role | null;
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
}

export const useStore = create<AppState>((set) => ({
    currentUser: null,
    inventory: [],
    agentMessages: [],
    weather: 'sunny',
    recommendation: null,
    analyticsData: [
        { name: 'Mon', sales: 4000, demand: 2400 },
        { name: 'Tue', sales: 3000, demand: 1398 },
        { name: 'Wed', sales: 2000, demand: 9800 },
        { name: 'Thu', sales: 2780, demand: 3908 },
        { name: 'Fri', sales: 1890, demand: 4800 },
        { name: 'Sat', sales: 2390, demand: 3800 },
        { name: 'Sun', sales: 3490, demand: 4300 },
    ],
    suppliers: [
        { id: 's1', name: 'Global Foods Inc', reliability: 98, deliveryDays: 2 },
        { id: 's2', name: 'Local Farms Co', reliability: 85, deliveryDays: 1 },
    ],

    setUser: (role) => set({ currentUser: role }),
    setWeather: (weather) => set({ weather }),

    fetchInitialData: async () => {
        try {
            // Fetch Products
            const pRes = await fetch('http://localhost:8000/products');
            const products = await pRes.json();

            // Map Backend snake_case to Frontend camelCase
            const inventory = products.map((p: any) => ({
                id: p.id.toString(),
                name: p.name,
                price: p.price,
                stock: p.stock,
                image: p.image_url,
                category: p.category,
                minStockThreshold: p.min_stock_threshold
            }));

            // Fetch Weather
            const wRes = await fetch('http://localhost:8000/weather');
            const wData = await wRes.json();

            set({
                inventory,
                weather: wData.condition,
                recommendation: wData.recommendation
            });
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        }
    },

    updateStock: (productId, amount) => set((state) => ({
        inventory: state.inventory.map(p =>
            p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p
        )
    })),

    addAgentMessage: (msg) => set((state) => ({
        agentMessages: [
            { ...msg, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() },
            ...state.agentMessages
        ].slice(0, 50) // Keep last 50 messages
    })),
}));
