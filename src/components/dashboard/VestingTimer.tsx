'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function VestingTimer() {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
        hours: 23,
        minutes: 45,
        seconds: 12
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else {
                    seconds = 59;
                    if (minutes > 0) {
                        minutes--;
                    } else {
                        minutes = 59;
                        if (hours > 0) {
                            hours--;
                        } else {
                            // Reset or trigger event
                            hours = 23;
                        }
                    }
                }
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 60;

    return (
        <Card className={cn(
            "bg-brand-gray border-sidebar-border overflow-hidden relative group transition-all duration-500",
            isUrgent && "border-brand-red animate-pulse"
        )}>
            <div className={cn(
                "absolute inset-0 opacity-10 pointer-events-none",
                isUrgent ? "bg-brand-red" : "bg-brand-gold"
            )} />

            <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    Vesting Cycle
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="font-mono text-5xl font-bold tracking-widest text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                </div>

                <p className={cn(
                    "mt-4 text-xs font-mono uppercase tracking-wider",
                    isUrgent ? "text-brand-red animate-bounce font-bold" : "text-gray-500"
                )}>
                    {isUrgent ? "🚨 EXPIRE SOON: BURN RT NOW!" : "Next Liquidation Event"}
                </p>

                {/* Progress Visual */}
                <div className="w-full h-1 bg-brand-black mt-4 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-gold blur-[1px]"
                        style={{ width: `${(timeLeft.hours / 24) * 100}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
