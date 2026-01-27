import React from 'react';
import { useStore } from '../store/useStore';

export const CustomerShop: React.FC = () => {
    const { inventory, addAgentMessage } = useStore();

    const handleBuy = (productName: string) => {
        addAgentMessage({
            from: 'customer',
            to: 'retailer',
            type: 'info',
            content: `Customer purchase initiated: ${productName}`
        });

        setTimeout(() => {
            addAgentMessage({
                from: 'retailer',
                to: 'supplier',
                type: 'warning',
                content: `Stock check: Low inventory predicted for ${productName}. Requesting re-order analysis.`
            });
        }, 1500);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventory.map((product) => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors group">
                    <div className="h-48 overflow-hidden relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <span className="text-purple-400 font-mono">${product.price.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mb-4">Stock: {product.stock} units</p>
                        <button
                            onClick={() => handleBuy(product.name)}
                            className="w-full py-2 bg-white/10 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
