"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurificationVessel } from "./PurificationVessel"
import { PurificationDebug } from "./PurificationDebug"
import { LogEntry } from "./MiningLog"
import { supabase, DUMMY_USER_ID } from "@/lib/supabase"

// ── Props ─────────────────────────────────────────────────────────
interface PurificationSectionProps {
    redTokens: number
    goldTokens: number
    setRedTokens: React.Dispatch<React.SetStateAction<number>>
    setGoldTokens: React.Dispatch<React.SetStateAction<number>>
    onLogEntry: (entry: LogEntry) => void
    /** Callback when purification impacts the balance bar */
    onImpact?: () => void
}

// ── Component ─────────────────────────────────────────────────────
export function PurificationSection({
    redTokens,
    goldTokens,
    setRedTokens,
    setGoldTokens,
    onLogEntry,
    onImpact,
}: PurificationSectionProps) {
    const [manualTrigger, setManualTrigger] = React.useState(false)

    const handlePurificationImpact = async () => {
        if (redTokens <= 0) return

        const amount = redTokens

        // A. Visual Feedback
        onImpact?.()

        // B. Data Conversion
        setRedTokens(0)
        setGoldTokens(prev => prev + amount)

        // C. Logs
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
            message: `✨ PURIFICATION: ${amount} RT transformed into Gold!`,
            type: "success"
        }
        onLogEntry(newLog)

        // D. Database Sync
        const { error } = await supabase.from('user_tokens').upsert({
            user_id: DUMMY_USER_ID,
            red_tokens: 0,
            gold_tokens: goldTokens + amount
        }, { onConflict: 'user_id' })

        if (error) console.error("Purification conversion error:", error)
    }

    return (
        <>
            {/* Purification Vessel Card */}
            <div className="md:col-span-12">
                <Card className="bg-brand-gray border-sidebar-border overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 via-orange-500/5 to-brand-gold/5 opacity-30 pointer-events-none" />
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-mono uppercase tracking-wider text-gray-400">
                            Purification Vessel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <PurificationVessel
                            redTokens={redTokens}
                            onPurify={handlePurificationImpact}
                            manualTrigger={manualTrigger}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Debug Panel */}
            <PurificationDebug
                onTestAnim={() => {
                    setManualTrigger(true)
                    setTimeout(() => setManualTrigger(false), 200)
                }}
                showAnim={false}
            />
        </>
    )
}
