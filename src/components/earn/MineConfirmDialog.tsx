"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Pickaxe } from "lucide-react"
import { cn } from "@/lib/utils"

interface MineConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    mode: "red" | "gold"
    exerciseLabel: string
    exerciseEmoji: string
    quantity: number
    tokenOutput: number
    repsPerToken: number
    minGain: number
}

export function MineConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    mode,
    exerciseLabel,
    exerciseEmoji,
    quantity,
    tokenOutput,
    repsPerToken,
    minGain,
}: MineConfirmDialogProps) {
    const tokenLabel = mode === "red" ? "RT" : "GT"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm z-[100] border-sidebar-border" style={{ backgroundColor: '#1E2329' }}>
                <DialogHeader>
                    <DialogTitle className={cn(
                        "flex items-center gap-2 font-mono",
                        tokenOutput <= 0 ? "text-yellow-500" : mode === "red" ? "text-brand-red" : "text-brand-gold"
                    )}>
                        {tokenOutput <= 0
                            ? <><AlertTriangle className="w-5 h-5" /> Confirm Mining</>
                            : <><Pickaxe className="w-5 h-5" /> Confirm Mining</>
                        }
                    </DialogTitle>
                </DialogHeader>
                <div className="text-sm text-gray-400 font-mono space-y-3">
                    <div className="flex justify-between items-center px-3 py-2 rounded bg-brand-black/50 border border-sidebar-border">
                        <span className="text-gray-500">Exercise</span>
                        <span className="text-white">{exerciseEmoji} {quantity} {exerciseLabel}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 rounded bg-brand-black/50 border border-sidebar-border">
                        <span className="text-gray-500">Output</span>
                        <span className={cn(
                            "font-bold",
                            tokenOutput > 0
                                ? mode === "red" ? "text-brand-red" : "text-brand-gold"
                                : "text-yellow-500"
                        )}>
                            {tokenOutput > 0 ? `+${tokenOutput}` : "0"} {tokenLabel}
                        </span>
                    </div>
                    {tokenOutput <= 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                            <span className="text-[11px] text-yellow-500/80">
                                Not enough reps — you need at least {repsPerToken} {exerciseLabel} to earn {minGain} {tokenLabel}
                            </span>
                        </div>
                    )}
                </div>
                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 border-sidebar-border text-gray-400 hover:text-white font-mono"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 font-mono font-bold",
                            tokenOutput <= 0
                                ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/30"
                                : mode === "red"
                                    ? "bg-red-600 hover:bg-red-500 text-white"
                                    : "bg-yellow-500 hover:bg-yellow-400 text-black"
                        )}
                    >
                        Proceed
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
