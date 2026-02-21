"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PurificationAnimProps {
    active: boolean
    onComplete?: () => void
    onImpact?: () => void
}

export function PurificationAnim({ active, onComplete, onImpact }: PurificationAnimProps) {
    const [phase, setPhase] = React.useState<"idle" | "pulse" | "explode">("idle")
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 })

    // Use refs for callbacks to avoid re-triggering effect when parent re-renders
    const onImpactRef = React.useRef(onImpact)
    const onCompleteRef = React.useRef(onComplete)

    React.useEffect(() => {
        onImpactRef.current = onImpact
        onCompleteRef.current = onComplete
    }, [onImpact, onComplete])

    React.useEffect(() => {
        if (active) {
            // Measure startPos immediately when active (before explosion)
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setStartPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                })
            }

            // STEP 1: Pulse (Start)
            setPhase("pulse")

            // STEP 2: Explode & Launch (1.0s)
            const cryptoTimer = setTimeout(() => {
                setPhase("explode")
            }, 1000)

            // STEP 3: Impact (1.75s - matches flight duration)
            const impactTimer = setTimeout(() => {
                onImpactRef.current?.()
            }, 1750)

            // STEP 4: Cleanup (2.5s)
            const endTimer = setTimeout(() => {
                setPhase("idle") // Hide
                onCompleteRef.current?.()
            }, 2500)

            return () => {
                clearTimeout(cryptoTimer)
                clearTimeout(impactTimer)
                clearTimeout(endTimer)
            }
        } else {
            setPhase("idle")
        }
    }, [active]) // Removed callbacks from dependencies

    if (!active && phase === "idle") return null

    return (
        <div ref={containerRef} className="absolute inset-0 z-50 pointer-events-none">
            {/* 
               GHOST BAR:
               Matches the parent's dimensions (w-full h-full).
               Parent must be the container of the progress bar.
            */}

            {/* 1. Pulsing Gold Bar (Overlay) */}
            <div
                className={cn(
                    "absolute inset-0 bg-yellow-400 rounded-full origin-center transition-all",
                    // Pulse Phase: Throb and Glow Gold
                    phase === "pulse" && "animate-pulse shadow-[0_0_30px_rgba(250,204,21,1)] scale-y-110 duration-100",
                    // Explode Phase: Expand and Vanish
                    phase === "explode" && "opacity-0 scale-x-125 scale-y-[4.0] duration-300 ease-out"
                )}
            />

            {/* 2. Explosion Flash (Gold Shockwave) */}
            {phase === "explode" && (
                <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                    {/* Inner intense white flash */}
                    <div className="absolute w-[150%] h-[500%] bg-white/80 blur-xl opacity-0 animate-[ping_0.4s_ease-out_forwards]" />

                    {/* Gold Shockwave */}
                    <div className="absolute w-[200%] h-[600%] bg-brand-gold/60 blur-2xl opacity-0 animate-[pulse_0.6s_ease-out_reverse_forwards]" />
                </div>
            )}

            {/* 3. The Flight (Projectile) */}
            {/* 
                Uses fixed positioning relative to viewport.
                Dynamic Start: Calculated from container ref.
                End: Fixed Top-Center (defined in globals.css @keyframes fly-dynamic)
            */}
            {phase === "explode" && (
                <div
                    className="fixed z-[99999] w-8 h-8 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,1)] pointer-events-none"
                    style={{
                        "--start-x": `${startPos.x}px`,
                        "--start-y": `${startPos.y}px`,
                        animation: "fly-dynamic 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
                    } as React.CSSProperties & Record<string, any>}
                >
                    <div className="absolute inset-0 bg-white blur-md animate-pulse" />
                </div>
            )}
        </div>
    )
}
