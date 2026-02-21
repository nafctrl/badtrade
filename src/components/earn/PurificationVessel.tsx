"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, Lock } from "lucide-react"
// Cleaned up: No imports needed for Dialog anymore
import { getPurificationProgress } from "@/lib/purification"

const MESSAGES = [
    "Cooking your bad habits into pure gold...",
    "Patience is bitter, but its fruit is sweet gold.",
    "Resisting the urge to spend... barely.",
    "Purifying your sins, one decimal at a time.",
    "Hold the line. Do not let the red tokens win.",
    "Transmuting regret into wealth.",
    "Diamond hands? No, Golden Soul.",
    "Watching paint dry is less profitable than this.",
    "A moment of discipline, a lifetime of gold.",
    "Your future self thanks you (probably).",
]

import { PurificationAnim } from "./PurificationAnim"

interface PurificationVesselProps {
    redTokens: number
    onPurify: () => void
    manualTrigger?: boolean
}

export function PurificationVessel({ redTokens, onPurify, manualTrigger }: PurificationVesselProps) {
    const [progress, setProgress] = React.useState(0)
    const [msgIndex, setMsgIndex] = React.useState(0)

    // Internal Animation State
    const [isPurifying, setIsPurifying] = React.useState(false)
    const lastNextDateRef = React.useRef<Date>(new Date())

    // 1. Initialize ref
    React.useEffect(() => {
        const { nextDate } = getPurificationProgress()
        lastNextDateRef.current = nextDate
    }, [])

    // 2. Poll for Triggers (Auto) + Progress
    React.useEffect(() => {
        const checkStatus = () => {
            const { nextDate, timeRemainingMs, progress: p } = getPurificationProgress()
            setProgress(p)

            // Trigger Logic
            const timeJumped = nextDate.getTime() > lastNextDateRef.current.getTime() + 1000
            const timeReached = timeRemainingMs <= 0

            // If triggered, available tokens, and not already running
            if ((timeJumped || timeReached) && redTokens > 0 && !isPurifying) {
                console.log("🔥 Vessel: Auto-Trigger Purification")
                setIsPurifying(true)
            }

            lastNextDateRef.current = nextDate
        }

        const interval = setInterval(checkStatus, 50) // Fast update for smooth bar
        return () => clearInterval(interval)
    }, [redTokens, isPurifying]) // Re-run if tokens change (to allow trigger)

    // 3. Manual Trigger Listener
    React.useEffect(() => {
        if (manualTrigger && !isPurifying) {
            console.log("🔥 Vessel: Manual Trigger")
            setIsPurifying(true)
        }
    }, [manualTrigger])

    // 4. Animation Callbacks
    const handleImpact = () => {
        // Trigger data conversion in parent
        onPurify()
    }

    const handleComplete = () => {
        // Reset internal state
        setIsPurifying(false)
    }

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % MESSAGES.length)
        }, 600000) // 10 minutes
        return () => clearInterval(interval)
    }, [])

    // Calculate color based on progress (Red -> Orange -> Gold)
    const getProgressColor = (p: number) => {
        if (p < 50) return "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        if (p < 90) return "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
        return "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse"
    }

    return (
        <div className="w-full space-y-4 relative">
            {/* 
                Explanation: 
                We need a non-overflow-hidden space for the explosion to expand.
                So we put PurificationAnim here, absolutely positioned over the bar area.
             */}

            {/* ANIMATION OVERLAY - Positioned to match the bar below */}
            {/* The bar is in the second div below (relative h-4). We can wrap it or just absolute position match it.
                 Easier to wrap the bar in a div that is relative but visible.
             */}

            <div className="space-y-2 relative">
                <div className="flex justify-between items-end text-xs font-mono uppercase tracking-wider text-zinc-500">
                    <span>Your Red Token is converting into GOLD</span>
                    <div className="flex flex-col items-start leading-none">
                        <span className={cn(
                            "font-mono tabular-nums tracking-tighter",
                            progress >= 90 ? "text-yellow-400" : "text-zinc-400"
                        )}>
                            <span className="text-2xl">{progress.toFixed(3)}</span>
                            <span className="ml-1 text-base opacity-70">%</span>
                        </span>
                        <span>PURIFIED</span>
                    </div>
                </div>

                {/* Bar Container */}
                <div className="relative">
                    {/* The Exploding Overlay - Sits on top, pointer-events-none */}
                    <PurificationAnim
                        active={isPurifying}
                        onImpact={handleImpact}
                        onComplete={handleComplete}
                    />

                    {/* The Actual Progress Bar */}
                    <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                            className={cn("absolute top-0 left-0 h-full transition-all duration-1000 ease-in-out", getProgressColor(progress))}
                            style={{ width: `${progress}%` }}
                        />

                        {/* Tick marks */}
                        <div className="absolute top-0 left-1/4 h-full w-px bg-zinc-950/30" />
                        <div className="absolute top-0 left-1/2 h-full w-px bg-zinc-950/30" />
                        <div className="absolute top-0 left-3/4 h-full w-px bg-zinc-950/30" />
                    </div>
                </div>

                <p className="text-center text-xs text-zinc-500 italic h-4 transition-all duration-500">
                    "{MESSAGES[msgIndex]}"
                </p>
            </div>
        </div>
    )
}
