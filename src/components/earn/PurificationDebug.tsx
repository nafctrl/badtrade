"use client"

import * as React from "react"
import { setDebugOffset, getPurificationProgress } from "@/lib/purification"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Settings2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PurificationAnim } from "./PurificationAnim"

interface PurificationDebugProps {
    onTestAnim?: () => void
    showAnim?: boolean
}

export function PurificationDebug({ onTestAnim, showAnim }: PurificationDebugProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [offsetHours, setOffsetHours] = React.useState(0)
    // const [showAnim, setShowAnim] = React.useState(false) // Moved to parent
    const [debugInfo, setDebugInfo] = React.useState<{
        nextDate: Date | null
        timeRemaining: string
    }>({ nextDate: null, timeRemaining: "" })

    React.useEffect(() => {
        if (!isOpen) return

        const update = () => {
            const { nextDate, timeRemainingMs } = getPurificationProgress()
            const totalSeconds = Math.floor(timeRemainingMs / 1000)
            const h = Math.floor(totalSeconds / 3600)
            const m = Math.floor((totalSeconds % 3600) / 60)
            const s = totalSeconds % 60
            setDebugInfo({
                nextDate,
                timeRemaining: `${h}h ${m}m ${s}s`
            })
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [isOpen, offsetHours])

    // Hide if not enabled in env
    // Note: NEXT_PUBLIC_ variables are available in client
    if (process.env.NEXT_PUBLIC_ENABLE_DEBUG !== "true") return null

    const handleOffsetChange = (val: number[]) => {
        const hours = val[0]
        setOffsetHours(hours)
        setDebugOffset(hours * 3600 * 1000)
    }

    const handleReset = () => {
        setOffsetHours(0)
        setDebugOffset(0)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 p-2 bg-brand-black/80 border border-gray-800 rounded-full text-gray-500 hover:text-white transition-colors z-50 shadow-lg"
            >
                <Settings2 className="w-4 h-4" />
            </button>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 w-72 bg-brand-black/95 border border-gray-800 rounded-xl p-4 z-50 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Purification Debug
                </h4>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>Time Travel</span>
                        <div className="flex flex-col items-end">
                            <span className={offsetHours > 0 ? "text-brand-gold" : "text-gray-500"}>
                                +{offsetHours} hours
                            </span>
                        </div>
                    </div>
                    <Slider
                        value={[offsetHours]}
                        min={0}
                        max={72}
                        step={0.1}
                        onValueChange={handleOffsetChange}
                        className="py-2"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => {
                            // Go to 10 seconds before next purification
                            const { timeRemainingMs } = getPurificationProgress()
                            // current offset + timeRemaining - 10s
                            // Actually we need to calculate target offset.
                            // Simplified: Add remaining time to current offset, minus buffer
                            const currentOffsetMs = offsetHours * 3600 * 1000
                            const targetOffsetMs = currentOffsetMs + timeRemainingMs + 1000 // +1s to push over edge? No, user wants *before* or *trigger*
                            // User asked for "Just Before" in plan, but maybe "Jump to End" is better.
                            // Let's do: Jump to 0.5s remaining, so next tick triggers it.
                            const jumpAmountMs = timeRemainingMs - 500
                            const newOffsetHours = offsetHours + (jumpAmountMs / (3600 * 1000))
                            handleOffsetChange([newOffsetHours])
                        }}
                        className="w-full h-6 text-[10px] font-mono bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50"
                    >
                        Jump to Trigger
                    </Button>
                </div>

                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                        <span>Next Event</span>
                        <span className="text-gray-400">
                            {debugInfo.nextDate?.toLocaleDateString()} {debugInfo.nextDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                        <span>Countdown</span>
                        <span className="text-brand-gold font-bold">
                            {debugInfo.timeRemaining}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReset}
                        className="w-full h-8 text-xs font-mono bg-brand-black border-gray-700 hover:bg-white/5"
                    >
                        Reset Time
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleOffsetChange([71.9])}
                        className="w-full h-8 text-xs font-mono bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 border border-brand-gold/30"
                    >
                        Near 100%
                    </Button>
                </div>

                {/* MANUAL ANIMATION TRIGGER */}
                <div className="pt-2 border-t border-gray-800">
                    <Button
                        size="sm"
                        onClick={onTestAnim}
                        className={cn(
                            "w-full h-8 text-xs font-mono font-bold transition-all",
                            showAnim
                                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                : "bg-yellow-400 text-black hover:bg-yellow-500"
                        )}
                    >
                        {showAnim ? "STOP ANIMATION" : "TEST ANIMATION"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
