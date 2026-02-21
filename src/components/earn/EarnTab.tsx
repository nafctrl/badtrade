"use client"

import * as React from "react"
import { MiningRig } from "./MiningRig"
import { PurificationSection } from "./PurificationSection"
import { MiningLog, LogEntry } from "./MiningLog"
import { TokenBalanceBar } from "./TokenBalanceBar"
import { Card, CardContent } from "@/components/ui/card"
import { useTokenBalances } from "@/lib/hooks"
import { cn } from "@/lib/utils"

/**
 * Self-contained Earn Tab that wraps MiningRig + PurificationSection + Log
 * with shared state. Used on the homepage tab and earn/page.tsx.
 */
interface EarnTabProps {
    className?: string
}

export function EarnTab({ className }: EarnTabProps) {
    const {
        redTokens, goldTokens, totalMined,
        setRedTokens, setGoldTokens, setTotalMined,
    } = useTokenBalances()

    const [logs, setLogs] = React.useState<LogEntry[]>([
        { id: "1", timestamp: "06:00:21", message: "System initialized", type: "info" },
        { id: "2", timestamp: "06:00:23", message: "Connected to neural link", type: "success" },
    ])

    const [impactTrigger, setImpactTrigger] = React.useState(false)
    const [flashToken, setFlashToken] = React.useState<"red" | "gold" | null>(null)

    const addLog = (entry: LogEntry) => {
        setLogs(prev => [entry, ...prev].slice(0, 15))
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Token Balance Bar */}
                <div className="md:col-span-12">
                    <TokenBalanceBar
                        redTokens={redTokens}
                        goldTokens={goldTokens}
                        blackTokens={0}
                        totalMined={totalMined}
                        flashToken={flashToken}
                        isImpacted={impactTrigger}
                    />
                </div>

                {/* Mining Card */}
                <MiningRig
                    redTokens={redTokens}
                    goldTokens={goldTokens}
                    totalMined={totalMined}
                    setRedTokens={setRedTokens}
                    setGoldTokens={setGoldTokens}
                    setTotalMined={setTotalMined}
                    onLogEntry={addLog}
                    onFlashToken={setFlashToken}
                />

                {/* Purification Vessel */}
                <PurificationSection
                    redTokens={redTokens}
                    goldTokens={goldTokens}
                    setRedTokens={setRedTokens}
                    setGoldTokens={setGoldTokens}
                    onLogEntry={addLog}
                    onImpact={() => {
                        setImpactTrigger(true)
                        setTimeout(() => setImpactTrigger(false), 300)
                    }}
                />

                {/* System Log */}
                <div className="md:col-span-12">
                    <Card className="bg-brand-gray border-sidebar-border overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                            <MiningLog logs={logs} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
