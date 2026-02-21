"use client"

import * as React from "react"
import { Hexagon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TokenBalanceBarProps {
    redTokens: number
    goldTokens: number
    blackTokens: number
    totalMined: number
    flashToken?: "red" | "gold" | null
    // Functional prop to receive trigger signal
    // This allows the parent (MiningRig) to call it based on PurificationAnim's timing
    isImpacted?: boolean
}

export function TokenBalanceBar({ redTokens, goldTokens, blackTokens, totalMined, flashToken, isImpacted }: TokenBalanceBarProps) {
    const [flashKey, setFlashKey] = React.useState(0)

    // Re-trigger animation when flashToken changes
    React.useEffect(() => {
        if (flashToken) {
            setFlashKey(prev => prev + 1)
        }
    }, [flashToken, redTokens, goldTokens])

    return (
        <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-brand-gray border border-sidebar-border">
            <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-2">
                    <Hexagon
                        key={`red-${flashKey}`}
                        className={cn("w-5 h-5", flashToken === "red" && "animate-bar-pulse")}
                        style={{ color: '#F6465D', fill: 'rgba(246,70,93,0.25)', filter: 'drop-shadow(0 0 4px rgba(246,70,93,0.4))' }}
                        strokeWidth={2.5}
                    />
                    <span className="text-[11px] font-mono font-bold text-gray-500">RT</span>
                    <span className="text-sm font-mono font-bold" style={{ color: '#F6465D' }}>
                        {redTokens.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                    </span>
                </div>
                <div className="w-px h-4 bg-sidebar-border" />

                {/* Gold Token Section */}
                <div className={cn(
                    "flex items-center gap-2 transition-all duration-300 origin-center",
                    isImpacted ? "scale-150 brightness-150 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" : "scale-100"
                )}>
                    <Hexagon
                        key={`gold-${flashKey}`}
                        className={cn("w-5 h-5", flashToken === "gold" && "animate-bar-pulse")}
                        style={{ color: '#F0B90B', fill: 'rgba(240,185,11,0.25)', filter: 'drop-shadow(0 0 4px rgba(240,185,11,0.4))' }}
                        strokeWidth={2.5}
                    />
                    <span className="text-[11px] font-mono font-bold text-gray-500">GT</span>
                    <span className="text-sm font-mono font-bold" style={{ color: '#F0B90B' }}>
                        {goldTokens.toLocaleString()}
                    </span>
                </div>
                <div className="w-px h-4 bg-sidebar-border" />
                <div className="flex items-center gap-2">
                    <Hexagon className="w-5 h-5" style={{ color: '#B0B8C1', fill: 'rgba(176,184,193,0.2)', filter: 'drop-shadow(0 0 4px rgba(176,184,193,0.3))' }} strokeWidth={2.5} />
                    <span className="text-[11px] font-mono font-bold text-gray-500">BT</span>
                    <span className="text-sm font-mono font-bold" style={{ color: '#B0B8C1' }}>
                        {blackTokens.toLocaleString()}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-gray-600">Mined</span>
                <span className="text-xs font-mono text-gray-400">{totalMined}</span>
            </div>
        </div>
    )
}
