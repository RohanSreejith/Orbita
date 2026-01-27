import React from 'react';
import { motion } from 'framer-motion';

export const WelcomeScreen = ({ onComplete }: { onComplete: () => void }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 3.5, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
        >
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 transform perspective-1000 rotate-x-60" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Container */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-8 relative"
                >
                    {/* Glowing Orb/Ring */}
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse" />

                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            className="w-16 h-16 rounded-xl border-2 border-purple-500 relative flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                        >
                            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-cyan-400 rounded-lg" />
                        </motion.div>
                        <motion.h1
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        >
                            ORBITA
                        </motion.h1>
                    </div>
                </motion.div>

                {/* Loading Status */}
                <motion.div className="flex flex-col items-center gap-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 200 }}
                        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                        className="h-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                    />

                    <div className="h-6 overflow-hidden relative">
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: -60 }}
                            transition={{ duration: 2.5, times: [0, 0.3, 0.6, 1] }}
                            className="flex flex-col items-center text-xs font-mono text-neutral-500 uppercase tracking-widest gap-2"
                        >
                            <span>Initializing System...</span>
                            <span className="text-cyan-400">Connecting Neural Link...</span>
                            <span className="text-purple-400">Loading Warehouse Modules...</span>
                            <span className="text-emerald-400">Access Granted</span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Version Tag */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="absolute bottom-10 text-[10px] text-white/20 font-mono"
            >
                KIOSK ALPHA V1.0 • SYSTEM ACTIVE
            </motion.div>
        </motion.div>
    );
};
