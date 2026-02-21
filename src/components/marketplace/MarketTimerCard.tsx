"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StopCircle, Timer } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MarketTimerCardProps {
    remaining: number   // ms
    progress: number    // 0-100
    isPaused: boolean
    onPauseToggle: () => void
    onStopEarly: () => void
    isDeleting?: boolean
}

function formatTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function MarketTimerCard({ remaining, progress, isPaused, onPauseToggle, onStopEarly, isDeleting }: MarketTimerCardProps) {
    const isUrgent = progress < 20 && !isPaused
    const [showConfirm, setShowConfirm] = React.useState(false)

    return (
        <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Header: Active badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isPaused ? "bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]" : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]")} />
                    <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest", isPaused ? "text-yellow-400" : "text-red-400")}>
                        {isPaused ? "Paused" : "Active"}
                    </span>
                </div>
                <Timer className={cn(
                    "w-4 h-4 shrink-0",
                    isPaused ? "text-yellow-500/50" : isUrgent ? "text-red-400 animate-pulse" : "text-red-500/50"
                )} />
            </div>

            {/* Countdown — large centered */}
            <div className="flex flex-col items-center justify-center py-2 relative">
                <div className={cn(
                    "font-mono text-4xl font-black tracking-wider tabular-nums transition-colors duration-300",
                    isPaused ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" : isUrgent ? "text-red-400 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" : "text-white"
                )}>
                    {formatTime(remaining)}
                </div>

                {/* Visual warning background glow when urgent */}
                {isUrgent && (
                    <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full -z-10 animate-pulse" />
                )}
            </div>

            {/* Progress bar — thin, visible */}
            <div className="w-full h-1.5 rounded-full bg-brand-black/80 overflow-hidden ring-1 ring-white/5">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-linear",
                        isPaused
                            ? "bg-gradient-to-r from-yellow-700 to-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                            : isUrgent
                                ? "bg-gradient-to-r from-red-600 to-red-400"
                                : "bg-gradient-to-r from-red-800 to-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full mt-1">
                <button
                    disabled={isDeleting}
                    onClick={onPauseToggle}
                    className={cn(
                        "flex-[1_1_0%] flex items-center justify-center py-2.5 rounded-lg",
                        "font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200",
                        isDeleting
                            ? "bg-zinc-950/30 text-zinc-700 border border-zinc-900/50 cursor-not-allowed"
                            : isPaused
                                ? "bg-brand-black/60 border border-green-900/30 text-green-500/70 hover:text-green-400 hover:bg-green-950/40"
                                : "bg-brand-black/60 border border-yellow-900/30 text-yellow-500/70 hover:text-yellow-400 hover:bg-yellow-950/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                    )}
                >
                    {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                    disabled={isDeleting}
                    onClick={() => setShowConfirm(true)}
                    className={cn(
                        "flex-[1.5_1.5_0%] flex items-center justify-center gap-2 py-2.5 rounded-lg",
                        "font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200",
                        isDeleting
                            ? "bg-red-950/30 text-red-900 border border-red-950/50 cursor-not-allowed"
                            : "bg-brand-black/60 border border-red-900/30 text-red-500/70 hover:text-red-400 hover:bg-red-950/40 hover:border-red-800/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                    )}
                >
                    <StopCircle className={cn("w-3.5 h-3.5", isDeleting && "animate-spin")} />
                    {isDeleting ? "Destroying..." : "Stop Early"}
                </button>
            </div>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent className="bg-brand-gray border-red-900/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-mono text-red-400">Destroy Active Item?</AlertDialogTitle>
                        <AlertDialogDescription className="font-mono text-gray-400">
                            If you stop early, the item will be destroyed immediately and its effect will vanish.
                            <br /><br />
                            <span className="text-red-500 font-bold">You will NOT receive a refund.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 border-t border-sidebar-border pt-4">
                        <AlertDialogCancel className="font-mono border-sidebar-border bg-brand-black/40 text-gray-400 hover:text-white hover:bg-zinc-800">
                            Keep Running
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setShowConfirm(false)
                                onStopEarly()
                            }}
                            className="font-mono bg-red-950/40 text-red-500 border border-red-900/50 hover:bg-red-900/50 hover:text-red-300"
                        >
                            Yes, Destroy It
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
