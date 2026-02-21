"use client"

import * as React from "react"
import { TokenToggle } from "./TokenToggle"
import { QuantityInput } from "./QuantityInput"
import { LogEntry } from "./MiningLog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MineConfirmDialog } from "./MineConfirmDialog"
import { Pickaxe, Flame, Sparkles, Hexagon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMiningHabits } from "@/hooks/useMiningHabits"
import { useMineAnimation } from "@/hooks/useMineAnimation"
import { useMiningActions } from "@/hooks/useMiningActions"

// ── Props ─────────────────────────────────────────────────────────
interface MiningRigProps {
    className?: string
    // Token balance state (owned by page)
    redTokens: number
    goldTokens: number
    totalMined: number
    setRedTokens: React.Dispatch<React.SetStateAction<number>>
    setGoldTokens: React.Dispatch<React.SetStateAction<number>>
    setTotalMined: React.Dispatch<React.SetStateAction<number>>
    // Callbacks
    onLogEntry: (entry: LogEntry) => void
    onFlashToken?: (token: "red" | "gold" | null) => void
}

// ── Component ─────────────────────────────────────────────────────
export function MiningRig({
    className,
    redTokens, goldTokens, totalMined,
    setRedTokens, setGoldTokens, setTotalMined,
    onLogEntry,
    onFlashToken,
}: MiningRigProps) {
    // ── Phase 1: Habits (from hook) ──
    const {
        mode, setMode,
        habits, exercise, setExercise,
        quantity, setQuantity,
        habitsLoading,
        currentExercise, isFaith, rate, tokenOutput,
    } = useMiningHabits()

    // ── Phase 2: Animation (from hook) ──
    const { mineAnim, flashToken, triggerMineAnimation } = useMineAnimation()

    // Forward flashToken changes to parent (for TokenBalanceBar)
    React.useEffect(() => {
        onFlashToken?.(flashToken)
    }, [flashToken, onFlashToken])

    const [showConfirm, setShowConfirm] = React.useState(false)

    // ── Phase 4: Mining DB Actions (from hook) ──
    const { submitMine } = useMiningActions()

    // ── Render ────────────────────────────────────────────────────────
    if (habitsLoading) return null

    const handleMineClick = () => {
        if (tokenOutput <= 0) {
            setShowConfirm(true)
            return
        }
        executeMine()
    }

    const handleConfirmMine = () => {
        setShowConfirm(false)
        executeMine()
    }

    const executeMine = async () => {
        const tokenLabel = mode === "red" ? "RT" : "GT"
        const isZero = tokenOutput <= 0

        // Phase 4: DB writes (fire-and-forget, runs in parallel with animation)
        submitMine({
            exerciseId: exercise,
            reps: quantity,
            mode,
            tokenOutput,
            currentRedTokens: redTokens,
            currentGoldTokens: goldTokens,
        })

        // Phase 2: Animation timeline (via hook)
        triggerMineAnimation(mode, tokenOutput, () => {
            // Phase 3 callback: update local balances + add log entry
            if (!isZero) {
                if (mode === "red") {
                    setRedTokens(prev => prev + tokenOutput)
                } else {
                    setGoldTokens(prev => prev + tokenOutput)
                }
                setTotalMined(prev => prev + 1)
            }

            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                message: isZero
                    ? `⚠ ${quantity} ${currentExercise?.label ?? 'reps'} → 0 ${tokenLabel} (not enough reps)`
                    : `${currentExercise?.emoji} ${quantity} ${currentExercise?.label} → ${tokenOutput} ${tokenLabel}`,
                type: isZero ? "warning" : "success"
            }
            onLogEntry(newLog)
        })
    }

    return (
        <div className={cn("md:col-span-12", className)}>
            <Card className="bg-brand-gray border-sidebar-border relative">
                <div className={cn(
                    "absolute inset-0 opacity-10 transition-all duration-500 pointer-events-none rounded-xl",
                    mode === "red"
                        ? "bg-gradient-to-br from-brand-red/20 via-transparent to-transparent"
                        : "bg-gradient-to-br from-brand-gold/20 via-transparent to-transparent"
                )} />
                <CardHeader className="pb-0">
                    <div className="flex items-center justify-start gap-4">
                        <TokenToggle
                            mode={mode}
                            onToggle={setMode}
                            disableRed={isFaith}
                        />
                        <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-gray-400">
                            {mode === "red"
                                ? <Flame className="w-4 h-4 text-brand-red" />
                                : <Sparkles className="w-4 h-4 text-brand-gold" />
                            }
                            Mine Tokens
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-6">

                    {/* Habit Selector */}
                    {habitsLoading ? (
                        <div className="flex gap-2">
                            <div className="flex-1 h-10 rounded-lg bg-brand-black/40 animate-pulse" />
                            <div className="flex-1 h-10 rounded-lg bg-brand-black/40 animate-pulse" />
                        </div>
                    ) : (
                        <div className="flex gap-2 flex-wrap">
                            {habits.map((ex) => (
                                <button
                                    key={ex.id}
                                    onClick={() => setExercise(ex.id)}
                                    className={cn(
                                        "flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-mono transition-all duration-200",
                                        exercise === ex.id
                                            ? "border-gray-500 bg-white/5 text-white"
                                            : "border-sidebar-border bg-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                                    )}
                                >
                                    <span>{ex.emoji}</span>
                                    <span>{ex.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Conversion Rate Info */}
                    {rate && currentExercise && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-brand-black/40 border border-sidebar-border">
                            <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider">Rate</span>
                            <span className="text-[11px] font-mono text-gray-400">
                                {rate.repsPerToken} {currentExercise.label} = 1 {mode === "red" ? "RT" : "GT"}
                                <span className="text-gray-600 ml-2">
                                    (min {rate.minGain} {mode === "red" ? "RT" : "GT"})
                                </span>
                            </span>
                        </div>
                    )}

                    <QuantityInput
                        value={quantity}
                        onChange={setQuantity}
                        unit={currentExercise?.unit}
                    />

                    {/* Token Output Preview */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-brand-black/60 border border-sidebar-border">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Output</span>
                        <span className={cn(
                            "text-xl font-bold font-mono tracking-tight",
                            tokenOutput > 0
                                ? mode === "red" ? "text-brand-red" : "text-brand-gold"
                                : "text-gray-600"
                        )}>
                            {tokenOutput > 0 ? `+${tokenOutput}` : "0"} {mode === "red" ? "RT" : "GT"}
                        </span>
                    </div>

                    {/* Zero output warning */}
                    {tokenOutput <= 0 && quantity > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <span className="text-yellow-500 text-xs">⚠</span>
                            <span className="text-[11px] font-mono text-yellow-500/80">
                                Not enough reps — you will gain 0 {mode === "red" ? "RT" : "GT"}
                            </span>
                        </div>
                    )}

                    {/* Mine Button with Animation */}
                    <div className="relative">
                        <Button
                            size="lg"
                            className={cn(
                                "w-full h-14 text-base font-bold tracking-widest uppercase transition-all duration-300 relative overflow-hidden group border-0 cursor-pointer",
                                mode === "red"
                                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_4px_20px_rgba(220,38,38,0.3)] text-white"
                                    : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-[0_4px_20px_rgba(234,179,8,0.3)] text-black",
                                mineAnim.pickaxe && "animate-mine-impact"
                            )}
                            onClick={handleMineClick}
                            disabled={mineAnim.active}
                        >
                            {/* Flash overlay */}
                            {mineAnim.pickaxe && (
                                <div
                                    className="absolute inset-0 animate-mine-flash rounded-lg"
                                    style={{ backgroundColor: mineAnim.floatColor }}
                                />
                            )}
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative flex items-center gap-3">
                                <Pickaxe className={cn(
                                    "w-5 h-5",
                                    mode === "red" ? "text-red-200" : "text-yellow-900",
                                    mineAnim.pickaxe && "animate-pickaxe-strike"
                                )} />
                                <span>Mine {mode === "red" ? "RT" : "GT"}</span>
                            </div>
                        </Button>

                        {/* Floating Token Text */}
                        {mineAnim.floatText && (
                            <div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <span
                                    className="animate-token-float text-2xl font-mono font-black drop-shadow-lg"
                                    style={{ color: mineAnim.floatColor }}
                                >
                                    {mineAnim.floatText}
                                </span>
                            </div>
                        )}

                        {/* Flying Coin */}
                        {mineAnim.coinFly && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <Hexagon
                                    className="w-6 h-6 animate-coin-fly"
                                    style={{
                                        color: mineAnim.coinColor,
                                        fill: mineAnim.coinColor + '40',
                                        filter: `drop-shadow(0 0 8px ${mineAnim.coinColor})`,
                                    }}
                                    strokeWidth={2.5}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <MineConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmMine}
                mode={mode}
                exerciseLabel={currentExercise?.label ?? ''}
                exerciseEmoji={currentExercise?.emoji ?? ''}
                quantity={quantity}
                tokenOutput={tokenOutput}
                repsPerToken={rate?.repsPerToken ?? 10}
                minGain={rate?.minGain ?? 0.5}
            />
        </div>
    )
}

// Re-export flashToken type for page-level use
export { useMineAnimation }
