import { create } from 'zustand';

export type Role = 'customer' | 'retailer' | 'supplier' | 'warehouse';

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    image: string;
    category: string;
}

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

    // Actions
    setUser: (role: Role | null) => void;
    updateStock: (productId: string, amount: number) => void;
    addAgentMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
}

export const useStore = create<AppState>((set) => ({
    currentUser: null,
    inventory: [
        { id: '1', name: 'Fresh Apples', price: 1.20, stock: 50, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', category: 'Fruits' },
        { id: '2', name: 'Organic Bananas', price: 0.80, stock: 120, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224', category: 'Fruits' },
        { id: '3', name: 'Whole Milk', price: 2.50, stock: 30, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b', category: 'Dairy' },
        { id: '4', name: 'Sourdough Bread', price: 3.00, stock: 15, image: 'https://images.unsplash.com/photo-1585478402431-7e1086bced25', category: 'Bakery' },
    ],
    agentMessages: [],

    setUser: (role) => set({ currentUser: role }),

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
