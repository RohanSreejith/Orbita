import React from 'react';
import { useStore } from '../store/useStore';
import { CloudRain, Sun, Cloud, CloudLightning, Sparkles } from 'lucide-react';


export const WeatherWidget: React.FC = () => {
    const { weather, recommendation } = useStore();

    const weatherIcons = {
        sunny: Sun,
        rainy: CloudRain,
        cloudy: Cloud,
        stormy: CloudLightning,
    };

    const WeatherIcon = weatherIcons[weather] || Sun;

    return (
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 rounded-xl p-6 relative overflow-hidden group">
            {/* Real Data Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 border border-white/5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider">LIVE API</span>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Local Conditions</h3>
                    <div className="flex items-center gap-3">
                        <WeatherIcon className="w-10 h-10 text-white" />
                        <div>
                            <span className="text-2xl font-bold capitalize block">{weather}</span>
                            <span className="text-xs text-neutral-400">24°C • Hum: 65%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Recommendation</span>
                </div>
                <p className="text-sm leading-relaxed">
                    Suggest stocking <span className="text-white font-bold underline decoration-purple-500 underline-offset-2">{recommendation?.item || 'Loading...'}</span>.
                    <br />
                    <span className="italic opacity-70 text-xs">Reason: {recommendation?.reason || 'Analyzing market...'}</span>
                </p>
            </div>

            {/* Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};
