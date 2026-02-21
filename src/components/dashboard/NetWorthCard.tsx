import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NetWorthCard() {
    const { balance } = useAppStore(); // Assuming balance = Gold Token (GT)
    const redTokens = 2450; // Mock Red Token (RT) count

    const totalEquity = balance + redTokens;
    const goldPercentage = (balance / totalEquity) * 100;
    const redPercentage = (redTokens / totalEquity) * 100;

    return (
        <Card className="bg-brand-gray border-sidebar-border overflow-hidden relative group">
            {/* Texture Background */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-brand-red/5 opacity-30 group-hover:opacity-50 transition-opacity" />

            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest font-mono">Total Net Worth</span>
                    <div className="flex gap-2">
                        <span className="text-[10px] text-brand-gold font-mono bg-brand-gold/10 px-1.5 py-0.5 rounded">GT: {Math.round(goldPercentage)}%</span>
                        <span className="text-[10px] text-brand-red font-mono bg-brand-red/10 px-1.5 py-0.5 rounded">RT: {Math.round(redPercentage)}%</span>
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white tracking-tighter font-mono">
                        ${totalEquity.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase text-gray-600 font-bold">USD Equiv.</span>
                </div>


                {/* Custom Progress Bar with Segments */}
                <div className="h-1.5 w-full bg-brand-black rounded-sm overflow-hidden flex mb-2">
                    <div
                        style={{ width: `${goldPercentage}%` }}
                        className="bg-brand-gold h-full shadow-[0_0_8px_rgba(240,185,11,0.4)] transition-all duration-1000 border-r border-black/50"
                    />
                    <div
                        style={{ width: `${redPercentage}%` }}
                        className="bg-brand-red h-full shadow-[0_0_8px_rgba(246,70,93,0.4)] transition-all duration-1000"
                    />
                </div>

                <p className="flex items-center gap-1.5 text-[10px] text-brand-red/90 font-mono mt-3">
                    <span className="w-1.5 h-1.5 bg-brand-red rounded-full animate-ping" />
                    High Volatility: Stack more GT to stabilize.
                </p>
            </CardContent>
        </Card>
    );
}
