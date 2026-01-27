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
    analyticsData: AnalyticsData[];
    suppliers: Supplier[];

    // Actions
    setUser: (role: Role | null) => void;
    updateStock: (productId: string, amount: number) => void;
    addAgentMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
    setWeather: (w: WeatherType) => void;
}

export const useStore = create<AppState>((set) => ({
    currentUser: null,
    inventory: [
        { id: '1', name: 'Fresh Apples', price: 1.20, stock: 50, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', category: 'Fruits', minStockThreshold: 10 },
        { id: '2', name: 'Organic Bananas', price: 0.80, stock: 120, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224', category: 'Fruits', minStockThreshold: 20 },
        { id: '3', name: 'Whole Milk', price: 2.50, stock: 30, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b', category: 'Dairy', minStockThreshold: 5 },
        { id: '4', name: 'Sourdough Bread', price: 3.00, stock: 15, image: 'https://images.unsplash.com/photo-1585478402431-7e1086bced25', category: 'Bakery', minStockThreshold: 5 },
        { id: '5', name: 'Umbrella', price: 15.00, stock: 5, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2', category: 'Accessories', minStockThreshold: 3 },
    ],
    agentMessages: [],
    weather: 'sunny',
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
