"use client"

import * as React from "react"
import { Hexagon, Power, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/lib/supabase"

import { useMarketTimer } from "../marketplace/useMarketTimer"
import { MarketTimerCard } from "../marketplace/MarketTimerCard"

interface InventoryItemCardProps {
    item: InventoryItem
    onUseItem: (id: string) => Promise<boolean>
    onDeleteItem?: (id: string) => Promise<boolean>
    onPauseItem?: (id: string, remainingMs: number) => Promise<boolean>
    onResumeItem?: (id: string) => Promise<boolean>
    onSyncTimer?: (id: string, newExpiresAt: string) => Promise<boolean>
}

const TOKEN_COLORS: Record<string, { color: string; fill: string; glow: string }> = {
    red: { color: "#F6465D", fill: "rgba(246,70,93,0.25)", glow: "rgba(246,70,93,0.4)" },
    gold: { color: "#F0B90B", fill: "rgba(240,185,11,0.25)", glow: "rgba(240,185,11,0.4)" },
    black: { color: "#B0B8C1", fill: "rgba(176,184,193,0.2)", glow: "rgba(176,184,193,0.3)" },
}

export function InventoryItemCard({ item, onUseItem, onDeleteItem, onPauseItem, onResumeItem, onSyncTimer }: InventoryItemCardProps) {
    const isInactive = item.status === 'Inactive'
    const colorTheme = TOKEN_COLORS[item.item_type] || TOKEN_COLORS.black
    const [isUsing, setIsUsing] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [showNonTimedConfirm, setShowNonTimedConfirm] = React.useState(false)

    // Local override for debounced pause/resume
    const [localOverride, setLocalOverride] = React.useState<{ type: 'paused', remainingMs: number } | { type: 'active', expiresAt: string } | null>(null)
    const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const activeExpiresAt = localOverride?.type === 'active' ? localOverride.expiresAt : (localOverride?.type === 'paused' ? null : (item.status === 'Active' ? item.expires_at : null))
    const activePausedMs = localOverride?.type === 'paused' ? localOverride.remainingMs : (localOverride?.type === 'active' ? null : (item.status === 'Paused' ? item.paused_remaining_ms : null))

    const timerStatus = useMarketTimer(
        activeExpiresAt,
        !isInactive ? item.duration_minutes : null,
        activePausedMs
    )

    // Handle auto-delete on expiration
    React.useEffect(() => {
        let mounted = true
        if (timerStatus.isExpired && !isDeleting && onDeleteItem) {
            setIsDeleting(true)
            onDeleteItem(item.id).finally(() => {
                if (mounted) setIsDeleting(false)
            })
        }
        return () => { mounted = false }
    }, [timerStatus.isExpired, isDeleting, onDeleteItem, item.id])

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
        }
    }, [])

    const handleUseClick = async () => {
        if (!isInactive) return
        if (!item.duration_minutes) {
            setShowNonTimedConfirm(true)
            return
        }
        setIsUsing(true)
        await onUseItem(item.id)
        setTimeout(() => setIsUsing(false), 500)
    }

    const handleStopEarly = async () => {
        if (!onDeleteItem) return
        setIsDeleting(true)
        await onDeleteItem(item.id)
        setIsDeleting(false)
    }

    const handlePauseToggle = () => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)

        if (timerStatus.isPaused) {
            // Re-activate locally
            const newExpiresAt = new Date(Date.now() + timerStatus.remaining).toISOString()
            setLocalOverride({ type: 'active', expiresAt: newExpiresAt })

            syncTimeoutRef.current = setTimeout(() => {
                onResumeItem?.(item.id)
                setLocalOverride(null)
            }, 2000)
        } else {
            // Pause locally
            const currentMs = timerStatus.remaining
            setLocalOverride({ type: 'paused', remainingMs: currentMs })

            syncTimeoutRef.current = setTimeout(() => {
                onPauseItem?.(item.id, currentMs)
                setLocalOverride(null)
            }, 2000)
        }
    }

    return (
        <div className={cn(
            "relative group rounded-xl border overflow-hidden transition-all duration-300",
            isInactive
                ? "bg-brand-gray border-sidebar-border hover:border-gray-600"
                : timerStatus.isActive
                    ? "bg-gradient-to-b from-red-950/30 via-brand-gray to-brand-gray border-red-900/30 ring-1 ring-red-500/10 shadow-[0_0_15px_rgba(246,70,93,0.08)]"
                    : "bg-brand-black/40 border-green-900/30 ring-1 ring-green-500/10 opacity-70"
        )}>
            <div className="relative p-5 flex flex-col gap-3">

                {/* Header: Emoji + Name */}
                <div className="flex items-start gap-3">
                    {item.item_emoji === "BT_HEX" || item.item_emoji === "GT_HEX" ? (
                        <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                            <Hexagon
                                className="w-7 h-7"
                                style={{
                                    color: colorTheme.color,
                                    fill: colorTheme.fill,
                                    filter: `drop-shadow(0 0 5px ${colorTheme.glow})`
                                }}
                                strokeWidth={2.5}
                            />
                        </div>
                    ) : (
                        <span className="text-2xl pt-1">
                            {item.item_emoji}
                        </span>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className={cn(
                                "text-sm font-mono font-bold truncate",
                                isInactive || timerStatus.isActive ? "text-white" : "text-gray-400"
                            )}>
                                {item.item_name}
                            </h3>
                            {/* Status Badge */}
                            {!isInactive && !timerStatus.isActive && (
                                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                    <span className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-widest">Active</span>
                                </div>
                            )}
                        </div>

                        {item.duration_minutes ? (
                            <p className={cn("text-[11px] font-mono mt-1", timerStatus.isActive ? "text-red-400/80" : "text-gray-500")}>
                                Duration: {item.duration_minutes} min
                            </p>
                        ) : (
                            <p className="text-[11px] font-mono text-gray-500 mt-1">
                                Non-timed item
                            </p>
                        )}
                        <p className={cn("text-[9px] font-mono mt-1", timerStatus.isActive ? "text-red-900" : "text-gray-600")}>
                            Purchased: {new Date(item.purchased_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Body Action Area */}
                {isInactive ? (
                    showNonTimedConfirm ? (
                        <div className="mt-2 flex flex-col gap-2 p-3 rounded-lg bg-zinc-900/40 border border-sidebar-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                            <p className="text-[10px] font-mono text-gray-400 text-center uppercase tracking-widest leading-relaxed">
                                Used in real life?
                            </p>
                            <div className="flex gap-2 w-full mt-1">
                                <button
                                    onClick={() => setShowNonTimedConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-1.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-widest bg-brand-black/60 text-gray-400 border border-sidebar-border hover:bg-zinc-800 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!onDeleteItem) return
                                        setIsDeleting(true)
                                        await onDeleteItem(item.id)
                                        setIsDeleting(false)
                                        setShowNonTimedConfirm(false)
                                    }}
                                    disabled={isDeleting}
                                    className="flex-1 py-1.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-widest bg-green-950/40 text-green-500 border border-green-900/50 hover:bg-green-900/50 hover:text-green-400 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    {isDeleting ? <Power className="w-3 h-3 animate-spin shrink-0" /> : <CheckCircle2 className="w-3 h-3 shrink-0" />}
                                    Yes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleUseClick}
                            disabled={isUsing}
                            className={cn(
                                "mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg",
                                "font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200",
                                isUsing
                                    ? "bg-zinc-800 text-zinc-500 cursor-wait border border-zinc-700/50"
                                    : "bg-brand-black/60 border border-sidebar-border text-gray-400 hover:text-white hover:bg-zinc-800 hover:border-gray-500 cursor-pointer"
                            )}
                        >
                            <Power className={cn("w-3.5 h-3.5", isUsing && "animate-spin")} />
                            {isUsing ? "Activating..." : "Use Item"}
                        </button>
                    )
                ) : timerStatus.isActive || timerStatus.isPaused ? (
                    <div className="mt-2">
                        <MarketTimerCard
                            remaining={timerStatus.remaining}
                            progress={timerStatus.progress}
                            isPaused={timerStatus.isPaused}
                            onStopEarly={handleStopEarly}
                            onPauseToggle={handlePauseToggle}
                            isDeleting={isDeleting}
                        />
                    </div>
                ) : (
                    <div className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest text-green-500/50 bg-brand-black/20 border border-transparent">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Item Active
                    </div>
                )}
            </div>
        </div>
    )
}
