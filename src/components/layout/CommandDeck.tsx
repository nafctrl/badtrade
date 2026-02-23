'use client';

import { cn } from "@/lib/utils";
import { LayoutDashboard, Terminal, ArrowRightLeft, Settings, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandDeckProps {
    activeTab: 'portfolio' | 'mining' | 'exchange' | 'governance';
    onTabChange: (tab: 'portfolio' | 'mining' | 'exchange' | 'governance') => void;
    onSettingsClick?: () => void;
}

export function CommandDeck({ activeTab, onTabChange, onSettingsClick }: CommandDeckProps) {

    const navItems = [
        {
            id: 'portfolio',
            label: 'Portfolio',
            icon: LayoutDashboard,
            activeColor: 'text-brand-gold',
            glowColor: 'shadow-[0_0_10px_rgba(240,185,11,0.5)]'
        },
        {
            id: 'mining',
            label: 'Earn',
            icon: Terminal,
            activeColor: 'text-brand-red',
            glowColor: 'shadow-[0_0_15px_rgba(246,70,93,0.6)]'
        },
        {
            id: 'exchange',
            label: 'Marketplace',
            icon: ArrowRightLeft,
            activeColor: 'text-brand-green',
            glowColor: 'shadow-[0_0_10px_rgba(14,203,129,0.5)]'
        }
    ] as const;

    return (
        <div className="fixed z-50 transition-all duration-300 ease-in-out">
            {/* Desktop Side Navigation */}
            <div className="hidden lg:flex flex-col w-52 h-screen bg-brand-black border-r border-sidebar-border p-4 fixed left-0 top-0">
                <div className="flex items-center gap-2 mb-10 px-2 mt-4">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-gold to-brand-red flex items-center justify-center font-bold text-black">
                        B
                    </div>
                    <h1 className="text-xl font-bold tracking-wider text-white">BAD<span className="text-brand-gold">TRADE</span></h1>
                </div>

                <div className="flex flex-col gap-1 flex-grow">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-left border-l-2",
                                activeTab === item.id
                                    ? `bg-sidebar-accent text-white ${item.glowColor} border-brand-gold`
                                    : "border-transparent text-gray-400 hover:bg-sidebar-accent/50 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", activeTab === item.id ? item.activeColor : "text-gray-500 group-hover:text-white")} />
                            <span className="font-medium tracking-wide font-mono text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-sidebar-border">
                    <button
                        onClick={() => onTabChange('governance')}
                        className={cn(
                            "flex items-center gap-4 px-4 py-3 w-full rounded-lg transition-all",
                            activeTab === 'governance'
                                ? "bg-sidebar-accent text-white shadow-[0_0_10px_rgba(100,100,100,0.3)]"
                                : "text-gray-400 hover:bg-sidebar-accent/50 hover:text-white"
                        )}
                    >
                        <ShieldCheck className={cn("w-5 h-5", activeTab === 'governance' ? "text-white" : "text-gray-500")} />
                        <span className="font-medium font-mono">Governance</span>
                    </button>
                    <div className="mt-4 px-4 text-xs text-gray-600 font-mono">
                        v0.1.0-alpha
                        <br />
                        NET: TESTNET
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-brand-black/90 backdrop-blur-xl border-t border-sidebar-border z-50 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
                        >
                            <div className={cn(
                                "p-1.5 rounded-full transition-all duration-300",
                                activeTab === item.id ? `${item.activeColor} bg-white/5` : "text-gray-500"
                            )}>
                                <item.icon className={cn("w-6 h-6", activeTab === item.id && "animate-pulse")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-mono uppercase tracking-wider",
                                activeTab === item.id ? "text-white" : "text-gray-600"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Top Header (Since Sidebar is hidden) */}
            <div className="lg:hidden fixed top-0 left-0 w-full h-14 bg-brand-black/95 border-b border-sidebar-border backdrop-blur-md px-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-gold to-brand-red flex items-center justify-center text-xs font-bold text-black">B</div>
                    <span className="font-bold tracking-wider text-white text-sm">BAD<span className="text-brand-gold">TRADE</span></span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onTabChange('governance')} className={cn(activeTab === 'governance' ? "text-white" : "text-gray-400 hover:text-white")}>
                        <ShieldCheck className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-red-400"
                        onClick={() => {
                            if (confirm("Terminate session?")) {
                                window.dispatchEvent(new Event("bt-logout"));
                            }
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
