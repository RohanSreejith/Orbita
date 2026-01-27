import React, { useEffect, useState } from 'react';
import { Truck, Package, Activity, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export const SupplierDashboard: React.FC = () => {
    // USE STORE: connect to global state to enable Agent Messages
    const { supplierData, fetchSupplierData, updateOrderStatus, supplierId } = useStore();
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
    const navigate = useNavigate();

    // Replaces local fetchDashboard
    useEffect(() => {
        fetchSupplierData();
        const interval = setInterval(fetchSupplierData, 5000); // Poll for new orders
        return () => clearInterval(interval);
    }, [supplierId, navigate]);

    const handleUpdateStatus = async (orderId: number, status: string) => {
        // USE STORE ACTION: Triggers API + Agent Message
        await updateOrderStatus(orderId, status);
    };

    // Use supplierData from store instead of local 'data'
    if (!supplierData) return <div className="p-10 text-center text-neutral-500">Loading Portal...</div>;

    const filteredOrders = (supplierData.active_orders || [])
        .filter((order: any) => {
            if (filter === 'pending') return order.status !== 'Delivered';
            return order.status === 'Delivered';
        })
        .sort((a: any, b: any) => b.id - a.id);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <Truck className="text-emerald-400" size={32} />
                    <h1 className="text-4xl font-bold text-white">{supplierData.name}</h1>
                </div>
                <div className="flex gap-6 text-sm">
                    <span className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Activity size={14} /> Reliability: {supplierData.reliability_score}%
                    </span>
                    <span className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        <Package size={14} /> Catalog Size: {supplierData.catalog.length} SKUs
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Incoming Orders Panel */}
                <div className="col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock size={20} className="text-amber-400" />
                            {filter === 'pending' ? 'Pending Requests' : 'Completed Requests'}
                        </h2>
                        <div className="flex bg-neutral-800 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'pending'
                                        ? 'bg-neutral-700 text-white shadow-sm'
                                        : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'completed'
                                        ? 'bg-emerald-900/50 text-emerald-400 shadow-sm'
                                        : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredOrders.length === 0 && (
                            <div className="p-8 text-center text-neutral-500 bg-neutral-800/30 rounded-xl border border-dashed border-white/5">
                                No {filter} orders found.
                            </div>
                        )}
                        {filteredOrders.map((order: any) => (
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

                        {/* Fake extra order - only show in completed */}
                        {filter === 'completed' && (
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
                        )}
                    </div>
                </div>

                {/* Catalog Management */}
                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 h-fit">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-emerald-400" /> Wholesale Catalog
                    </h2>

                    <div className="space-y-3">
                        {supplierData.catalog.map((item: any, idx: number) => (
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
