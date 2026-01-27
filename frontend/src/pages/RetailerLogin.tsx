import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { API_BASE } from '../lib/api';

export const RetailerLogin: React.FC = () => {
    const navigate = useNavigate();
    const login = useStore((state) => state.login);
    const [stores, setStores] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetch(`${API_BASE}/stores`)
            .then(res => res.json())
            .then(data => setStores(data))
            .catch(err => console.error("Failed to load stores", err));
    }, []);

    const handleLogin = (storeId: number, name: string) => {
        login('retailer', storeId, name);
        navigate('/retailer');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[150px]" />

            <div className="relative z-10 w-full max-w-md">
                <button
                    onClick={() => navigate('/shop')} // Changed to go back to shop or main
                    className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Kiosk
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-2xl border border-purple-500/20 bg-black/40 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                            <Store size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Select Kiosk</h1>
                            <p className="text-neutral-400 text-sm">Choose your retail location</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {stores.length === 0 && <div className="text-neutral-500 text-center py-4">Loading Locations...</div>}

                        {stores.map((store) => (
                            <button
                                key={store.id}
                                onClick={() => handleLogin(store.id, store.name)}
                                className="w-full py-4 px-5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 transition-all text-left flex items-center justify-between group"
                            >
                                <div>
                                    <div className="font-semibold text-white group-hover:text-purple-300">{store.name}</div>
                                    <div className="text-xs text-neutral-500">{store.location} • ID: {store.id}</div>
                                </div>
                                <div className={clsx("w-2.5 h-2.5 rounded-full", store.has_alerts ? "bg-yellow-500" : "bg-green-500")} />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
