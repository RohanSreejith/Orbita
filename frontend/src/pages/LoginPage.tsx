import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, Truck, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const login = useStore((state) => state.login);



    const handleRoleLogin = (role: 'customer' | 'supplier', path: string, id?: number, name?: string) => {
        login(role, id, name);
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[150px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 text-center mb-12"
            >
                <h1 className="text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    ORBITA
                </h1>
                <p className="text-neutral-400 text-lg">Unified Retail Intelligence System</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-500 font-mono">SYSTEM ONLINE | 2026</span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full z-10">

                {/* Retailer Section */}
                <RoleCard
                    title="Retailer"
                    icon={Store}
                    color="purple"
                    delay={0.1}
                >
                    <p className="text-neutral-500 text-sm mb-6 mt-2">
                        Manage inventory, view sales analytics, and restock products.
                    </p>
                    <button
                        onClick={() => navigate('/login/retailer')}
                        className="w-full py-3 bg-white/10 hover:bg-purple-500/20 text-white border border-white/10 hover:border-purple-500/50 rounded-lg font-medium transition-all"
                    >
                        Select Kiosk
                    </button>
                </RoleCard>

                {/* Customer Section */}
                <RoleCard
                    title="Customer"
                    icon={ShoppingBag}
                    color="blue"
                    delay={0.2}
                >
                    <p className="text-neutral-500 text-sm mb-6 mt-2">
                        Browse the global catalog, compare prices across kiosks, and verify product reviews.
                    </p>
                    <button
                        onClick={() => handleRoleLogin('customer', '/shop')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                    >
                        Start Shopping
                    </button>
                </RoleCard>

                {/* Supplier Section */}
                <RoleCard
                    title="Supplier"
                    icon={Truck}
                    color="emerald"
                    delay={0.3}
                >
                    <p className="text-neutral-500 text-sm mb-6 mt-2">
                        Manage wholesale inventory, fulfill restock orders, and analyze B2B demand.
                    </p>
                    <button
                        onClick={() => navigate('/login/supplier')}
                        className="w-full py-3 bg-white/10 hover:bg-emerald-500/20 text-white border border-white/10 hover:border-emerald-500/50 rounded-lg font-medium transition-all"
                    >
                        Select Organization
                    </button>
                </RoleCard>

            </div>

            <footer className="absolute bottom-6 text-neutral-600 text-xs font-mono">
                CODEX '26 HACKATHON BUILD • v2.1.0 • SECURE CONNECTION
            </footer>
        </div>
    );
};

const RoleCard = ({ title, icon: Icon, children, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={clsx(
            "p-8 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl relative group overflow-hidden",
            color === 'purple' && "hover:border-purple-500/30",
            color === 'blue' && "hover:border-blue-500/30",
            color === 'emerald' && "hover:border-emerald-500/30",
        )}
    >
        <div className={clsx(
            "absolute top-0 right-0 p-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
            color === 'purple' && "bg-purple-600",
            color === 'blue' && "bg-blue-600",
            color === 'emerald' && "bg-emerald-600",
        )} />

        <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className={clsx(
                "p-3 rounded-lg bg-white/5",
                color === 'purple' && "text-purple-400",
                color === 'blue' && "text-blue-400",
                color === 'emerald' && "text-emerald-400",
            )}>
                <Icon size={24} />
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        <div className="relative z-10">
            {children}
        </div>
    </motion.div>
);
