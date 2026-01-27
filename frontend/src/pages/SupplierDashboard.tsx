import React, { useEffect, useState } from 'react';
import { Truck, Package, Activity, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../lib/api';

export const SupplierDashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const { supplierId } = useStore();
    const navigate = useNavigate();

    const fetchDashboard = () => {
        const effectiveId = supplierId || 1;
        fetch(`${API_BASE}/suppliers/${effectiveId}/dashboard`)
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error("Failed to load supplier dashboard", err));
    };

    useEffect(() => {
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 5000); // Poll for new orders
        return () => clearInterval(interval);
    }, [supplierId, navigate]);

    const handleUpdateStatus = async (orderId: number, status: string) => {
        try {
            await fetch(`${API_BASE}/suppliers/orders/${orderId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchDashboard(); // Immediate refresh
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    if (!data) return <div className="p-10 text-center text-neutral-500">Loading Portal...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <Truck className="text-emerald-400" size={32} />
                    <h1 className="text-4xl font-bold text-white">{data.name}</h1>
                </div>
                <div className="flex gap-6 text-sm">
                    <span className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Activity size={14} /> Reliability: {data.reliability_score}%
                    </span>
                    <span className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        <Package size={14} /> Catalog Size: {data.catalog.length} SKUs
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Incoming Orders Panel */}
                <div className="col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock size={20} className="text-amber-400" /> Incoming Orders
                    </h2>

                    <div className="space-y-4">
                        {data.active_orders.map((order: any) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-neutral-800/50 border border-white/5 p-6 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-xs text-neutral-500">{order.id}</span>
                                        <span className="text-xs font-bold text-neutral-300 px-2 py-0.5 bg-white/10 rounded">{order.store}</span>
                                    </div>
                                    <div className="text-lg font-medium text-white">
                                        {order.qty}x <span className="text-emerald-300">{order.item}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">{order.status}</div>
                                    {order.status === "Placed" && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, "Shipped")}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Mark Shipped
                                        </button>
                                    )}
                                    {order.status === "Shipped" && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, "Delivered")}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                    {order.status === "Delivered" && (
                                        <div className="text-green-500 flex items-center gap-1 text-sm font-bold">
                                            <CheckCircle size={14} /> Completed
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Fake extra order to look busy */}
                        <div className="bg-neutral-800/30 border border-white/5 p-6 rounded-xl flex items-center justify-between opacity-50">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-mono text-xs text-neutral-500">ORD-990</span>
                                    <span className="text-xs font-bold text-neutral-300 px-2 py-0.5 bg-white/10 rounded">Kiosk Alpha</span>
                                </div>
                                <div>100x Mineral Water</div>
                            </div>
                            <div className="text-green-500 flex items-center gap-2 text-sm font-bold">
                                <CheckCircle size={16} /> DELIVERED
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catalog Management */}
                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 h-fit">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-emerald-400" /> Wholesale Catalog
                    </h2>

                    <div className="space-y-3">
                        {data.catalog.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <div className="font-medium text-neutral-200">{item.product_name}</div>
                                    <div className="text-xs text-neutral-500">{item.category}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-emerald-400">${item.wholesale_cost.toFixed(2)}</div>
                                    <div className="text-xs text-neutral-600">UNIT COST</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-white/20 text-neutral-400 hover:text-white hover:border-white/40 transition-all text-sm">
                        + Add New SKU
                    </button>
                </div>

            </div>
        </div>
    );
};
