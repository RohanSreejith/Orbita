import React from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const InventoryTable: React.FC = () => {
    const { inventory } = useStore();

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg">Live Inventory</h3>
                <span className="text-xs font-mono text-neutral-400 bg-black/20 px-2 py-1 rounded">
                    REAL-TIME
                </span>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-neutral-400">
                    <tr>
                        <th className="px-6 py-3 font-medium">Product</th>
                        <th className="px-6 py-3 font-medium">Category</th>
                        <th className="px-6 py-3 font-medium">Price</th>
                        <th className="px-6 py-3 font-medium">Stock</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {inventory.map((product) => (
                        <tr key={product.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <img src={product.image} alt="" className="w-8 h-8 rounded object-cover bg-white/10" />
                                <span className="font-medium">{product.name}</span>
                            </td>
                            <td className="px-6 py-4 text-neutral-400">{product.category}</td>
                            <td className="px-6 py-4 font-mono">${product.price.toFixed(2)}</td>
                            <td className="px-6 py-4 font-mono">{product.stock}</td>
                            <td className="px-6 py-4">
                                {product.stock <= product.minStockThreshold ? (
                                    <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
                                        <AlertTriangle className="w-3 h-3" />
                                        Low Stock
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold uppercase tracking-wider">
                                        <CheckCircle className="w-3 h-3" />
                                        In Stock
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
