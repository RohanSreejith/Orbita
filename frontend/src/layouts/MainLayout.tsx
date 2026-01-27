import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AgentMind } from '../components/AgentMind';
import { ShoppingBag, Truck, BarChart3, CircuitBoard, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../store/useStore';
import { NotificationWidget } from '../components/NotificationWidget';

export const MainLayout: React.FC = () => {
    const { userRole, storeName, logout } = useStore();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!userRole) {
            navigate('/');
        }
    }, [userRole, navigate]);

    const navItems = [
        { path: '/shop', label: 'Customer', icon: ShoppingBag },
        { path: '/login/retailer', label: 'Retailer', icon: BarChart3 },
        { path: '/login/supplier', label: 'Supply & Warehouse', icon: Truck },
    ];

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-purple-500/30">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-lg border-b border-white/5 z-40 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <CircuitBoard className="text-purple-500 w-6 h-6" />
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        ORBITA
                    </span>
                    {storeName && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 border border-white/5 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {storeName}
                        </span>
                    )}
                </div>

                <div className="flex gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                                isActive
                                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/20 shadow-glow"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    {userRole === 'retailer' && <NotificationWidget />}

                    <button onClick={logout} className="text-neutral-500 hover:text-white transition-colors" title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-20 px-6 pb-6 min-h-screen relative z-10">
                <Outlet />
            </main>

            {/* Floating Agent Overlay */}
            <AgentMind />

            {/* Background ambient glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};
