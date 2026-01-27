import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { API_BASE } from '../lib/api';

import { clsx } from 'clsx'; // Missing import

export const SupplierLogin: React.FC = () => {
    const navigate = useNavigate();
    const login = useStore((state) => state.login);
    const [suppliers, setSuppliers] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetch(`${API_BASE}/suppliers`)
            .then(res => res.json())
            .then(data => setSuppliers(data))
            .catch(err => console.error("Failed to load suppliers", err));
    }, []);

    const handleLogin = (id: number, name: string) => {
        login('supplier', id, name);
        navigate('/supply-chain');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[150px]" />

            <div className="relative z-10 w-full max-w-md">
                <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Kiosk
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-2xl border border-emerald-500/20 bg-black/40 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Truck size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Select Organization</h1>
                            <p className="text-neutral-400 text-sm">Log in to supplier portal</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {suppliers.length === 0 && <div className="text-neutral-500 text-center py-4">Loading Logistics...</div>}

                        {suppliers.map((sup) => (
                            <button
                                key={sup.id}
                                onClick={() => handleLogin(sup.id, sup.name)}
                                className="w-full py-4 px-5 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
                            >
                                <div>
                                    <div className="font-semibold text-white group-hover:text-emerald-300">{sup.name}</div>
                                    <div className="text-xs text-neutral-500">Reliability: {sup.reliability}% • ID: {sup.id}</div>
                                </div>
                                <div className={clsx("w-2.5 h-2.5 rounded-full", sup.reliability > 85 ? "bg-emerald-500" : "bg-yellow-500")} />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
