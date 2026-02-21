"use client"

import * as React from "react"
import { Hexagon, Skull, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export type TokenType = "red" | "gold" | "black"

export interface MarketItemData {
    id: string
    name: string
    description: string
    cost: number
    tokenType: TokenType
    emoji: string
    stock?: number | null  // null = unlimited
    duration_minutes?: number | null  // null = instant (non-timed)
}

const TOKEN_CONFIG: Record<TokenType, { label: string; color: string; fill: string; glow: string }> = {
    red: { label: "RT", color: "#F6465D", fill: "rgba(246,70,93,0.25)", glow: "rgba(246,70,93,0.4)" },
    gold: { label: "GT", color: "#F0B90B", fill: "rgba(240,185,11,0.25)", glow: "rgba(240,185,11,0.4)" },
    black: { label: "BT", color: "#B0B8C1", fill: "rgba(176,184,193,0.2)", glow: "rgba(176,184,193,0.3)" },
}

const HOLD_DURATION = 4000 // 4 seconds
const TICK_INTERVAL = 50  // update every 50ms

interface MarketItemProps {
    item: MarketItemData
    balance: number
    onBuy: (item: MarketItemData, rect?: DOMRect) => void
}

export function MarketItem({ item, balance, onBuy }: MarketItemProps) {
    const cardRef = React.useRef<HTMLDivElement>(null)
    const token = TOKEN_CONFIG[item.tokenType]
    const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0
    const canAfford = balance >= item.cost && !outOfStock
    const isRedToken = item.tokenType === "red"

    // Timer logic removed for future rework

    // Hold-to-burn state (only for RT items)
    const [holdProgress, setHoldProgress] = React.useState(0) // 0-100
    const [isHolding, setIsHolding] = React.useState(false)
    const [isCharred, setIsCharred] = React.useState(false)
    const holdRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = React.useRef(0)

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (holdRef.current) clearInterval(holdRef.current)
        }
    }, [])

    const startHold = React.useCallback(() => {
        if (!canAfford || !isRedToken || isCharred) return
        setIsHolding(true)
        startTimeRef.current = Date.now()

        holdRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current
            const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100)
            setHoldProgress(progress)

            if (progress >= 100) {
                if (holdRef.current) clearInterval(holdRef.current)
                holdRef.current = null
                setIsHolding(false)
                setIsCharred(true)
            }
        }, TICK_INTERVAL)
    }, [canAfford, isRedToken, isCharred])

    const endHold = React.useCallback(() => {
        if (!isRedToken || isCharred) return
        if (holdRef.current) {
            clearInterval(holdRef.current)
            holdRef.current = null
        }
        setIsHolding(false)
        setHoldProgress(0)
    }, [isRedToken, isCharred])

    const handleCharredClick = () => {
        if (isCharred) {
            onBuy(item, cardRef.current?.getBoundingClientRect())
            // Reset state after purchase flow
            setTimeout(() => {
                setIsCharred(false)
                setHoldProgress(0)
            }, 300)
        }
    }

    // Text progression based on hold progress
    const getButtonText = () => {
        if (outOfStock) return "Sold Out"
        if (!canAfford) return "Insufficient"
        if (isCharred) return "BURN IT anyway"
        if (!isRedToken) return "Burn Tokens"
        if (!isHolding) return "Hold to Burn"
        if (holdProgress < 40) return "BURNING..."
        return "DON'T DO IT..."
    }

    const getButtonIcon = () => {
        if (isCharred) return <Flame className="w-3.5 h-3.5" />
        if (isHolding && holdProgress >= 40) return <Skull className="w-3.5 h-3.5 animate-pulse" />
        if (isHolding) return <Flame className="w-3.5 h-3.5 animate-pulse" />
        return <Skull className="w-3.5 h-3.5" />
    }

    return (
        <div ref={cardRef} className={cn(
            "relative group rounded-xl border bg-brand-gray overflow-hidden transition-all duration-300",
            canAfford
                ? "border-sidebar-border hover:border-gray-600 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                : "border-sidebar-border/50 opacity-50"
        )}>
            {/* Danger gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 via-transparent to-red-950/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-5 flex flex-col gap-3">
                {/* Header: Emoji + Name */}
                <div className="flex items-start gap-3">
                    {item.emoji === "BT_HEX" ? (
                        <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                            <Hexagon
                                className="w-7 h-7"
                                style={{
                                    color: TOKEN_CONFIG.black.color,
                                    fill: TOKEN_CONFIG.black.fill,
                                    filter: `drop-shadow(0 0 5px ${TOKEN_CONFIG.black.glow})`
                                }}
                                strokeWidth={2.5}
                            />
                        </div>
                    ) : (
                        <span className="text-2xl">{item.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-mono font-bold text-white truncate">{item.name}</h3>
                        <p className="text-[11px] font-mono text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border">
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">Price</span>
                    <div className="flex items-center gap-1.5">
                        <Hexagon className="w-4 h-4" style={{ color: token.color, fill: token.fill, filter: `drop-shadow(0 0 3px ${token.glow})` }} strokeWidth={2.5} />
                        <span className="text-sm font-mono font-bold" style={{ color: token.color }}>
                            {item.cost} {token.label}
                        </span>
                    </div>
                </div>

                {/* Stock indicator */}
                {item.stock !== null && item.stock !== undefined && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-brand-black/40 border border-sidebar-border">
                        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">Stock</span>
                        <span className={cn(
                            "text-xs font-mono font-bold",
                            item.stock <= 0 ? "text-red-500" : item.stock <= 3 ? "text-yellow-500" : "text-gray-400"
                        )}>
                            {item.stock <= 0 ? "SOLD OUT" : `${item.stock} left`}
                        </span>
                    </div>
                )}

                {/* Buy Button */}
                {isRedToken && canAfford ? (
                    // Red Token: Hold-to-burn button
                    <div className="relative w-full select-none">
                        <button
                            disabled={!canAfford}
                            onMouseDown={!isCharred ? startHold : undefined}
                            onMouseUp={!isCharred ? endHold : undefined}
                            onMouseLeave={!isCharred ? endHold : undefined}
                            onTouchStart={!isCharred ? (e) => { e.preventDefault(); startHold() } : undefined}
                            onTouchEnd={!isCharred ? endHold : undefined}
                            onTouchCancel={!isCharred ? endHold : undefined}
                            onClick={isCharred ? handleCharredClick : undefined}
                            className={cn(
                                "relative w-full py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-widest border overflow-hidden",
                                "transition-all duration-200",
                                isCharred
                                    ? "bg-zinc-950 border-zinc-700/50 text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 cursor-pointer shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
                                    : isHolding
                                        ? "bg-red-950/40 border-red-800/60 text-red-300 cursor-grabbing"
                                        : "bg-red-950/40 border-red-800/40 text-red-400 hover:bg-red-900/60 hover:border-red-700/50 hover:text-red-300 cursor-grab"
                            )}
                        >
                            {/* Fill animation background */}
                            {!isCharred && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-red-800/60 via-red-700/50 to-red-600/40 transition-none"
                                    style={{
                                        width: `${holdProgress}%`,
                                        transition: isHolding ? 'none' : 'width 0.3s ease-out',
                                    }}
                                />
                            )}

                            {/* Charred texture overlay */}
                            {isCharred && (
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 opacity-60" />
                            )}

                            {/* Button text */}
                            <div className="relative flex items-center justify-center gap-2 z-10">
                                {getButtonIcon()}
                                <span className={cn(
                                    isHolding && holdProgress >= 40 && "animate-pulse"
                                )}>
                                    {getButtonText()}
                                </span>
                            </div>
                        </button>
                    </div>
                ) : (
                    // Non-red tokens or insufficient: regular click button
                    <button
                        disabled={!canAfford}
                        onClick={() => onBuy(item, cardRef.current?.getBoundingClientRect())}
                        className={cn(
                            "w-full py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200 border cursor-pointer",
                            canAfford
                                ? "bg-red-950/40 border-red-800/40 text-red-400 hover:bg-red-900/60 hover:border-red-700/50 hover:text-red-300 hover:shadow-[0_0_12px_rgba(220,38,38,0.2)]"
                                : "bg-zinc-900/50 border-zinc-800/50 text-zinc-600 cursor-not-allowed"
                        )}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Skull className="w-3.5 h-3.5" />
                            {canAfford ? "Burn Tokens" : "Insufficient"}
                        </div>
                    </button>
                )}
            </div>
        </div>
    )
}
