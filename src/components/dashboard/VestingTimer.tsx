'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getPurificationProgress } from "@/lib/purification";

export function VestingTimer() {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [nextDateStr, setNextDateStr] = useState<string>("");
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const updateTimer = () => {
            const { timeRemainingMs, nextDate, progress: currentProgress } = getPurificationProgress();

            if (timeRemainingMs <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setProgress(100);
            } else {
                const totalSeconds = Math.floor(timeRemainingMs / 1000);
                const days = Math.floor(totalSeconds / (3600 * 24));
                const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                setTimeLeft({ days, hours, minutes, seconds });
                setProgress(currentProgress);
            }

            // Format date, e.g., "Nov 3, 23:00"
            const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
            setNextDateStr(nextDate.toLocaleString(undefined, dateOpts));
        };

        // Initial update
        updateTimer();

        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, []);

    // Full container background progress styles
    const getProgressColor = (p: number) => {
        if (p < 50) return "bg-red-600/20 border-r-red-500 shadow-[inset_0_0_30px_rgba(220,38,38,0.2)]";
        if (p < 90) return "bg-orange-500/20 border-r-orange-500 shadow-[inset_0_0_30px_rgba(249,115,22,0.2)]";
        return "bg-brand-gold/20 border-r-brand-gold shadow-[inset_0_0_30px_rgba(250,204,21,0.2)]";
    };

    return (
        <Card className="bg-brand-gray border-sidebar-border overflow-hidden relative group transition-all duration-500 hover:border-sidebar-border/80 flex flex-col h-full min-h-[200px]">

            {/* Base Background (Dims on hover) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-brand-gold transition-opacity duration-700 group-hover:opacity-0" />

            {/* FULL HEIGHT BACKGROUND PROGRESS BAR (Hover Reveal) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div
                    className={cn(
                        "absolute top-0 left-0 h-full transition-all duration-1000 ease-in-out border-r-2",
                        getProgressColor(progress)
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Huge Overlay Text (Hover) */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col items-center justify-center translate-y-4 group-hover:translate-y-0">
                <span className={cn(
                    "font-mono text-5xl lg:text-7xl font-black tabular-nums tracking-tighter drop-shadow-2xl",
                    progress >= 90 ? "text-brand-gold" : "text-white"
                )}>
                    {progress.toFixed(2)}%
                </span>
                <span className="text-xs uppercase font-mono tracking-widest text-gray-300 mt-2 font-bold drop-shadow-md pb-4">
                    Purified
                </span>
            </div>

            {/* Original Content Wrapper (Dims and scales slightly on hover) */}
            <div className="relative z-10 flex flex-col flex-1 transition-all duration-700 group-hover:opacity-5 group-hover:blur-[2px] group-hover:scale-95">
                <CardHeader className="pb-2">
                    <CardTitle className="text-gray-400 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        Purification Event
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center p-4 lg:py-6 gap-3 flex-1">
                    {/* Stack Days and Time vertically for a compact square fit */}
                    <div className="flex flex-col items-center justify-center gap-2 w-full">
                        {/* Days Component */}
                        <div className="flex flex-col items-center justify-center">
                            <span className="font-mono text-5xl lg:text-7xl font-black tracking-tight text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] leading-none">
                                {String(timeLeft.days).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-gray-500 mt-1">Days</span>
                        </div>

                        {/* Separator - Hidden on vertical stack, but we can keep a subtle line */}
                        <div className="w-12 h-[1px] bg-sidebar-border mx-auto my-1 rounded-full opacity-50" />

                        {/* Hours:Minutes:Seconds Component */}
                        <div className="flex flex-col items-center justify-center max-w-full">
                            <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest text-brand-gold tabular-nums drop-shadow-[0_0_10px_rgba(250,204,21,0.2)] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    <p className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-gray-400 text-center w-full leading-tight text-balance">
                        Expected: <br className="sm:hidden" /><span className="text-white font-bold">{nextDateStr || "..."}</span>
                    </p>
                </CardContent>
            </div>
        </Card>
    );
}
