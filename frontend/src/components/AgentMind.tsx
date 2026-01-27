import React from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const AgentMind: React.FC = () => {
    const { agentMessages } = useStore();

    if (agentMessages.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 z-50 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl text-white">
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-sm tracking-wider uppercase">Neural Link Activity</span>
                </div>

                <div className="space-y-3 max-h-60 overflow-hidden relative">
                    <AnimatePresence initial={false}>
                        {agentMessages.slice(0, 4).map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: 20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className={clsx(
                                    "p-3 rounded-lg border-l-4 text-xs font-mono",
                                    msg.type === 'info' && "bg-blue-500/10 border-blue-500",
                                    msg.type === 'warning' && "bg-amber-500/10 border-amber-500",
                                    msg.type === 'success' && "bg-green-500/10 border-green-500",
                                )}
                            >
                                <div className="flex justify-between text-[10px] opacity-60 mb-1">
                                    <span className="uppercase">{msg.from}</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="uppercase">{msg.to}</span>
                                </div>
                                <p className="leading-relaxed">{msg.content}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Gradient fade at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
            </div>
        </div>
    );
};
