import React from 'react';
import { InventoryTable } from '../components/InventoryTable';
import { WeatherWidget } from '../components/WeatherWidget';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { BarChart3, TrendingUp } from 'lucide-react';

export const RetailerDashboard: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
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
                            <h3 className="text-3xl font-bold mt-1 text-amber-500">3</h3>
                        </div>
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Weather & Recommendations */}
                <WeatherWidget />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Inventory - Takes up 2/3 */}
                <div className="lg:col-span-2">
                    <InventoryTable />
                </div>

                {/* Charts - Takes up 1/3 */}
                <div className="lg:col-span-1">
                    <AnalyticsCharts />
                </div>
            </div>
        </div>
    );
};
