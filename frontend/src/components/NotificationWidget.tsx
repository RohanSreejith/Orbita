import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { API_BASE } from '../lib/api';

export const NotificationWidget = () => {
    const { notifications, fetchNotifications, approveOrder, rejectOrder, inventory, pendingDeliveries } = useStore();
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState<number | null>(null);

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (id: number) => {
        setProcessing(id);
        await approveOrder(id);
        setProcessing(null);
    };

    const handleReject = async (id: number) => {
        setProcessing(id);
        await rejectOrder(id);
        setProcessing(null);
    };

    // Sort by Newest First
    // Combine Server Notifications + Low Stock Alerts
    const alerts = inventory.filter(p => p.stock <= p.minStockThreshold);

    // Sort notifications by timestamp
    const sortedNotifications = [...notifications].sort((a: any, b: any) => b.timestamp - a.timestamp);

    const totalCount = notifications.length + alerts.length;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
            >
                <Bell size={20} />
                {totalCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-black" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-12 w-96 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-3 bg-white/5 border-b border-white/5 font-bold text-sm text-white flex justify-between items-center">
                            <span>Pending Approvals</span>
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{totalCount}</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {totalCount === 0 ? (
                                <div className="p-8 text-center text-neutral-500 text-xs">
                                    No alerts or pending approvals.
                                </div>
                            ) : (
                                <>
                                    {/* Smart Procurement Proposals (Low Stock) */}
                                    {alerts.map((item: any) => {
                                        // Check if already ordered
                                        const pendingOrder = pendingDeliveries.find((o: any) => o.product_id === item.productId);

                                        // Dynamic AI Analysis
                                        let trendAnalysis = "Steady Demand";
                                        let trendColor = "text-blue-400";
                                        let multiplier = 2.5;

                                        if (item.stock === 0) {
                                            trendAnalysis = "Critical Shortage";
                                            trendColor = "text-red-500 animate-pulse";
                                            multiplier = 4;
                                        } else if (item.stock < item.minStockThreshold / 2) {
                                            trendAnalysis = "High Velocity";
                                            trendColor = "text-emerald-400";
                                            multiplier = 3;
                                        }

                                        // Ensure meaningful quantity (at least 20 or multiplier * threshold)
                                        const recommendedQty = Math.max(20, Math.ceil((item.minStockThreshold * multiplier) - item.stock));

                                        // If pending, show the ordered quantity
                                        const displayQty = pendingOrder ? pendingOrder.quantity : recommendedQty;
                                        const estCost = displayQty * item.price * 0.8;

                                        return (
                                            <div key={`alert-${item.productId}`} className="p-4 border-b border-white/5 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="flex h-2 w-2 relative">
                                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pendingOrder ? 'bg-amber-400' : 'bg-purple-400'} opacity-75`}></span>
                                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${pendingOrder ? 'bg-amber-500' : 'bg-purple-500'}`}></span>
                                                            </span>
                                                            <div className={`text-xs font-bold ${pendingOrder ? 'text-amber-300' : 'text-purple-300'} uppercase tracking-wide`}>
                                                                {pendingOrder ? 'Awaiting Delivery' : 'AI Procurement Proposal'}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-bold text-white mb-1">{item.name}</div>

                                                        {/* AI Analysis Details */}
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400 mt-2 bg-black/20 p-2 rounded border border-white/5">
                                                            <div>Trend: <span className={`${trendColor} font-bold`}>{trendAnalysis} ↗</span></div>
                                                            <div>Rec. Qty: <span className="text-white font-bold">{displayQty} units</span></div>
                                                            <div>Source: <span className="text-blue-300">Global Foods Inc</span></div>
                                                            <div>Est. Cost: <span className="text-white font-bold">${estCost.toFixed(2)}</span></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mt-3">
                                                    {pendingOrder ? (
                                                        <div className="w-full py-1.5 bg-amber-500/10 border border-amber-500/20 rounded text-xs font-bold text-amber-500 flex items-center justify-center gap-2">
                                                            <span className="animate-spin">⏳</span> Processing at Warehouse...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold text-neutral-400 transition-colors"
                                                                onClick={() => {
                                                                    // Dismiss logic would go here
                                                                }}
                                                            >
                                                                Decline
                                                            </button>
                                                            <button
                                                                className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
                                                                onClick={async () => {
                                                                    const storeId = useStore.getState().storeId || 1;
                                                                    try {
                                                                        await fetch(`${API_BASE}/retailers/orders`, {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({
                                                                                store_id: storeId,
                                                                                product_id: item.productId,
                                                                                supplier_id: 1,
                                                                                quantity: recommendedQty
                                                                            })
                                                                        });

                                                                        useStore.getState().addAgentMessage({
                                                                            from: 'retailer',
                                                                            to: 'warehouse',
                                                                            content: `Approved Order for ${item.name} (${recommendedQty} units). Sent to Global Foods Inc.`,
                                                                            type: 'success'
                                                                        });

                                                                        // Refresh to fetch the new pending order status
                                                                        useStore.getState().fetchNotifications();
                                                                        useStore.getState().runRestockAgent();
                                                                    } catch (e) {
                                                                        console.error("Order failed", e);
                                                                    }
                                                                }}
                                                            >
                                                                Approve & Order
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Existing Notifications */}
                                    {sortedNotifications.map((n: any) => (
                                        <div key={n.order_id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="text-sm font-bold text-white">{n.product_name}</div>
                                                    <div className="text-xs text-neutral-500 mt-0.5">Supplier: {n.supplier_name}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded font-mono">
                                                        {n.quantity}x
                                                    </div>
                                                    <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                                                        ${typeof n.cost === 'number' ? n.cost.toFixed(2) : '---'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleReject(n.order_id)}
                                                    disabled={processing === n.order_id}
                                                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-xs font-bold text-red-500 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                >
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(n.order_id)}
                                                    disabled={processing === n.order_id}
                                                    className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-black rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                >
                                                    {processing === n.order_id ? "Processing..." : "Approve"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
