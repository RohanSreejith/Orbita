import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, ArrowRight, Minus, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

export const AgentMind: React.FC = () => {
    const { agentMessages } = useStore();
    const [isMinimized, setIsMinimized] = useState(false);

    if (agentMessages.length === 0) return null;

    return (
        <div className={clsx("fixed bottom-4 left-4 z-50 transition-all duration-300 pointer-events-none", isMinimized ? "w-72" : "w-96")}>
            <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-white pointer-events-auto overflow-hidden">
                {/* Header */}
                <div
                    className={clsx(
                        "flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors",
                        !isMinimized && "border-b border-white/10"
                    )}
                    onClick={() => setIsMinimized(!isMinimized)}
                >
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span className="font-bold text-sm tracking-wider uppercase">Neural Link</span>
                    </div>
                    <button className="text-neutral-400 hover:text-white transition-colors">
                        {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="p-4 pt-2 space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 relative">
                                <AnimatePresence initial={false}>
                                    {agentMessages.slice(0, 4).map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, x: 20, height: 0 }}
                                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                                            exit={{ opacity: 0, x: -20, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={clsx(
                                                "p-3 rounded-lg border-l-4 text-xs font-mono mb-2 last:mb-0",
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

                                {/* Fade overlay at bottom if needed, though scrollbar helps */}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
