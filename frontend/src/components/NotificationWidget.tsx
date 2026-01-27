import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export const NotificationWidget = () => {
    const { notifications, fetchNotifications, approveOrder, rejectOrder } = useStore();
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
    const sortedNotifications = [...notifications].sort((a: any, b: any) => b.timestamp - a.timestamp);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
            >
                <Bell size={20} />
                {notifications.length > 0 && (
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
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{notifications.length}</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {sortedNotifications.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 text-xs">
                                    No pending approvals.
                                </div>
                            ) : (
                                sortedNotifications.map((n: any) => (
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
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
