import React from 'react';
import { useStore } from '../store/useStore';
import { CloudRain, Sun, Cloud, CloudLightning, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const WeatherWidget: React.FC = () => {
    const { weather, setWeather } = useStore();

    const weatherIcons = {
        sunny: Sun,
        rainy: CloudRain,
        cloudy: Cloud,
        stormy: CloudLightning,
    };

    const WeatherIcon = weatherIcons[weather];

    // Mock recommendation logic
    const recommendations = {
        sunny: { item: 'Cold Drinks', reason: 'High temperature predicted.' },
        rainy: { item: 'Umbrellas', reason: 'Heavy rainfall expected.' },
        cloudy: { item: 'Tea/Coffee', reason: 'Cooler breeze detected.' },
        stormy: { item: 'Batteries', reason: 'Power outage possibility.' },
    };

    const rec = recommendations[weather];

    return (
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 rounded-xl p-6 relative overflow-hidden group">
            {/* Interactive Weather Toggles (Hidden trigger for demo) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {(Object.keys(weatherIcons) as Array<keyof typeof weatherIcons>).map(w => (
                    <button
                        key={w}
                        onClick={() => setWeather(w)}
                        className={`w-2 h-2 rounded-full ${weather === w ? 'bg-white' : 'bg-white/20'}`}
                        title={w}
                    />
                ))}
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
                    Suggest stocking <span className="text-white font-bold underline decoration-purple-500 underline-offset-2">{rec.item}</span>.
                    <br />
                    <span className="italic opacity-70 text-xs">Reason: {rec.reason}</span>
                </p>
            </div>

            {/* Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};
