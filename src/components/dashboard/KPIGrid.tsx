import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Zap, Activity, AlertTriangle, TrendingUp, Dumbbell, Flame, Sparkles } from "lucide-react";

interface KPIItemProps {
    label: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color: string;
    loading?: boolean;
}

function KPIItem({ label, value, icon: Icon, trend, trendUp, color, loading }: KPIItemProps) {
    if (loading) {
        return (
            <Card className="bg-brand-gray border-sidebar-border relative overflow-hidden h-full">
                <CardContent className="p-3 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                        <div className="h-4 w-4 bg-white/10 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-brand-gray border-sidebar-border relative overflow-hidden group hover:border-sidebar-ring/50 transition-colors">
            <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">{label}</span>
                    <Icon className={cn("w-3.5 h-3.5 opacity-70", color)} />
                </div>

                <div className="flex flex-col gap-0.5">
                    <div className="text-sm font-bold text-white font-mono tracking-tight">{value}</div>
                    {trend && (
                        <div className={cn(
                            "text-[9px] font-mono",
                            trendUp ? "text-brand-green" : "text-brand-red"
                        )}>
                            {trend}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

interface KPIGridProps {
    pushupCount: number;
    pushupTrend: number;
    loading: boolean;
}

export function KPIGrid({ pushupCount, pushupTrend, loading }: KPIGridProps) {
    console.log("KPIGrid Rendered. Props:", { pushupCount, pushupTrend, loading });

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            <KPIItem
                label="Pushups"
                value={!loading ? pushupCount.toLocaleString() : "..."}
                icon={Activity}
                color="text-brand-red"
                trend={!loading ? `+${pushupTrend} Today` : "..."}
                trendUp={true}
                loading={loading}
            />
            <KPIItem
                label="Pull Ups"
                value="45"
                icon={Dumbbell}
                color="text-brand-gold"
                trend="+5 Today"
                trendUp={true}
            />
            <KPIItem
                label="Tokens Purified"
                value="12.5 GT"
                icon={Sparkles}
                color="text-brand-gold"
                trend="+2.5 Week"
                trendUp={true}
            />
            <KPIItem
                label="RT/GT Spent"
                value="0"
                icon={Flame}
                color="text-brand-red"
                trend="-0% vs L.W."
                trendUp={false}
            />
        </div>
    );
}
