"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Flame, Hexagon } from "lucide-react"
import { MarketItemData } from "./MarketItem"

const TOKEN_CONFIG: Record<string, { label: string; color: string; fill: string; glow: string }> = {
    red: { label: "RT", color: "#F6465D", fill: "rgba(246,70,93,0.25)", glow: "rgba(246,70,93,0.4)" },
    gold: { label: "GT", color: "#F0B90B", fill: "rgba(240,185,11,0.25)", glow: "rgba(240,185,11,0.4)" },
    black: { label: "BT", color: "#B0B8C1", fill: "rgba(176,184,193,0.2)", glow: "rgba(176,184,193,0.3)" },
}

// Rough conversion: how many reps per token (for the "guilt" display)
const REPS_PER_TOKEN: Record<string, { exercise: string; reps: number }> = {
    red: { exercise: "Push-ups", reps: 10 },
    gold: { exercise: "Push-ups", reps: 20 },
    black: { exercise: "Push-ups", reps: 50 },
}

interface PurchaseConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    item: MarketItemData | null
}

export function PurchaseConfirmDialog({ open, onOpenChange, onConfirm, item }: PurchaseConfirmDialogProps) {
    if (!item) return null

    const token = TOKEN_CONFIG[item.tokenType]
    const repsInfo = REPS_PER_TOKEN[item.tokenType]
    const totalReps = item.cost * repsInfo.reps

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm z-[100] border-red-900/30" style={{ backgroundColor: '#1A1215' }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-mono text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Confirm Purchase
                    </DialogTitle>
                </DialogHeader>

                <div className="text-sm text-gray-400 font-mono space-y-3">
                    {/* Item info */}
                    <div className="flex justify-between items-center px-3 py-2 rounded bg-brand-black/50 border border-sidebar-border">
                        <span className="text-gray-500">Item</span>
                        <span className="text-white">{item.emoji} {item.name}</span>
                    </div>

                    {/* Cost */}
                    <div className="flex justify-between items-center px-3 py-2 rounded bg-brand-black/50 border border-sidebar-border">
                        <span className="text-gray-500">Cost</span>
                        <div className="flex items-center gap-1.5">
                            <Hexagon className="w-4 h-4" style={{ color: token.color, fill: token.fill }} strokeWidth={2.5} />
                            <span className="font-bold" style={{ color: token.color }}>
                                -{item.cost} {token.label}
                            </span>
                        </div>
                    </div>

                    {/* Exercise cost translation — the guilt trip */}
                    <div className="flex items-start gap-2.5 px-3 py-3 rounded bg-red-950/30 border border-red-900/30">
                        <Flame className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-1">
                            <span className="text-[11px] text-red-400/90 block font-bold uppercase tracking-wider">
                                Reality Check
                            </span>
                            <span className="text-[12px] text-red-300/70 block">
                                This costs you <span className="text-white font-bold">{totalReps} {repsInfo.exercise}</span> worth of effort.
                            </span>
                            <span className="text-[11px] text-red-400/50 block">
                                Are you really going to burn that?
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 border-green-800/30 text-green-400 hover:bg-green-900/20 hover:text-green-300 font-mono font-bold"
                    >
                        Keep Tokens
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex-1 font-mono font-bold bg-red-900/50 text-red-400 hover:bg-red-800/60 border border-red-800/40"
                    >
                        Burn {item.cost} {token.label}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
