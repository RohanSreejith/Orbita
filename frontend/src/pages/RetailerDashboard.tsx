import React, { useState } from 'react';
import { InventoryTable } from '../components/InventoryTable';
import { WeatherWidget } from '../components/WeatherWidget';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { BarChart3, TrendingUp, X, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';



const NotificationWidget = () => {
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
                className="absolute -top-16 right-0 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors relative"
            >
                <Bell size={20} className="text-white" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black" />
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



export const RetailerDashboard: React.FC = () => {
    const { inventory, runRestockAgent } = useStore();
    const activeAlerts = inventory.filter(p => p.stock <= p.minStockThreshold).length;

    // Simulate background agent running periodically
    React.useEffect(() => {
        const run = async () => {
            await runRestockAgent();
        };
        // Run immediately on mount, then every 60s
        run();
        const interval = setInterval(run, 60000);
        return () => clearInterval(interval);
    }, []);

    // Restock Modal State
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [supplierOptions, setSupplierOptions] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'success'>('idle');

    const handleRestock = async (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        setOrderStatus('idle');

        // Fetch Supplier Options
        try {
            const res = await fetch(`http://127.0.0.1:8000/products/${product.productId}/suppliers`);
            const data = await res.json();
            setSupplierOptions(data);
        } catch (e) {
            console.error("Failed to load suppliers", e);
        }
    };

    const handlePlaceOrder = async (supplierName: string) => {
        // Find supplier ID from options
        const supplier = supplierOptions.find(s => s.supplier_name === supplierName);
        if (!supplier || !selectedProduct) return;

        try {
            await fetch('http://127.0.0.1:8000/retailers/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: 1, // Default to Kiosk Alpha (or get from store state)
                    product_id: selectedProduct.productId,
                    supplier_id: supplier.supplier_id,
                    quantity: 50 // Default restock quantity
                })
            });
            setOrderStatus('success');
            setTimeout(() => {
                setIsModalOpen(false);
                setOrderStatus('idle');
            }, 2000);
        } catch (e) {
            console.error("Failed to place manual order", e);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-900/40 border border-green-500/20 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Sales (Today)</p>
                            <h3 className="text-3xl font-bold mt-1 text-white">$4,290.50</h3>
                        </div>
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Active Alerts</p>
                            <h3 className="text-3xl font-bold mt-1 text-amber-500">{activeAlerts}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Weather & Recommendations */}
                <WeatherWidget />

                {/* Notifications Widget */}
                <NotificationWidget />
            </div>

            {/* Agent Section Removed (Running within Notifications Widget logic) */}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Inventory - Takes up 2/3 */}
                <div className="lg:col-span-2">
                    <InventoryTable onRestock={handleRestock} />
                </div>

                {/* Charts - Takes up 1/3 */}
                <div className="lg:col-span-1">
                    <AnalyticsCharts />
                </div>
            </div>

            {/* Restock Modal */}
            <AnimatePresence>
                {isModalOpen && selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-4">
                                    <img src={selectedProduct.image} className="w-12 h-12 rounded-lg object-cover" />
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Restock {selectedProduct.name}</h2>
                                        <p className="text-sm text-neutral-400">Current Stock: {selectedProduct.stock}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                                    <X />
                                </button>
                            </div>

                            <div className="p-6">
                                {orderStatus === 'success' ? (
                                    <div className="text-center py-12">
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                                        >
                                            <CheckCircle className="text-black w-8 h-8" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-white">Order Placed!</h3>
                                        <p className="text-neutral-400">Restock shipment initiated.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-4 text-sm text-blue-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                            <AlertCircle size={16} />
                                            <span>AI Recommendation: "Global Foods Inc" has the best reliability score for urgent delivery.</span>
                                        </div>

                                        <table className="w-full text-left">
                                            <thead className="text-xs uppercase text-neutral-500 font-bold bg-black/20">
                                                <tr>
                                                    <th className="p-3">Supplier</th>
                                                    <th className="p-3">Cost / Unit</th>
                                                    <th className="p-3">Delivery</th>
                                                    <th className="p-3">Reliability</th>
                                                    <th className="p-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {supplierOptions.map((opt) => (
                                                    <tr key={opt.supplier_id} className="hover:bg-white/5">
                                                        <td className="p-3 font-medium text-white">{opt.supplier_name}</td>
                                                        <td className="p-3 font-mono text-emerald-400">${opt.wholesale_cost.toFixed(2)}</td>
                                                        <td className="p-3 text-sm">{opt.delivery_days} Days</td>
                                                        <td className="p-3">
                                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={clsx("h-full", opt.reliability > 90 ? "bg-green-500" : "bg-yellow-500")}
                                                                    style={{ width: `${opt.reliability}%` }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <button
                                                                onClick={() => handlePlaceOrder(opt.supplier_name)}
                                                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                                                            >
                                                                Order
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
