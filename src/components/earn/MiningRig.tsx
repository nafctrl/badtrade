"use client"

import * as React from "react"
import { TokenToggle } from "./TokenToggle"
import { QuantityInput } from "./QuantityInput"
import { PurificationVessel } from "./PurificationVessel"
import { PurificationDebug } from "./PurificationDebug"
import { MiningLog, LogEntry } from "./MiningLog"
import { TokenBalanceBar } from "./TokenBalanceBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MineConfirmDialog } from "./MineConfirmDialog"
import { Pickaxe, Flame, Sparkles, Hexagon } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase, DUMMY_USER_ID } from "@/lib/supabase"
import { useTokenBalances } from "@/lib/hooks"
import { getPurificationProgress } from "@/lib/purification"

// ── Habit Config (loaded from Supabase) ───────────────────────────
interface HabitConfig {
    id: string
    category: string
    label: string
    emoji: string
    unit: string
    rates: {
        red: { repsPerToken: number; minGain: number }
        gold: { repsPerToken: number; minGain: number }
    }
}

function calculateTokens(reps: number, repsPerToken: number, minGain: number): number {
    const raw = reps / repsPerToken
    if (raw < minGain) return 0
    // For GT (minGain=1): floor. For RT (minGain=0.5): round to 0.5
    if (minGain >= 1) return Math.floor(raw)
    return Math.floor(raw / minGain) * minGain
}

// ── Component ─────────────────────────────────────────────────────
interface MiningRigProps {
    className?: string
}

export function MiningRig({ className }: MiningRigProps) {
    const [mode, setMode] = React.useState<"red" | "gold">("red")
    const [habits, setHabits] = React.useState<HabitConfig[]>([])
    const [exercise, setExercise] = React.useState<string>("")
    const [quantity, setQuantity] = React.useState(10)
    const [habitsLoading, setHabitsLoading] = React.useState(true)
    const [logs, setLogs] = React.useState<LogEntry[]>([
        { id: "1", timestamp: "06:00:21", message: "System initialized", type: "info" },
        { id: "2", timestamp: "06:00:23", message: "Connected to neural link", type: "success" },
    ])
    const [showConfirm, setShowConfirm] = React.useState(false)

    // ── Mining Animation State ──
    const [mineAnim, setMineAnim] = React.useState<{
        active: boolean
        pickaxe: boolean
        floatText: string | null
        floatColor: string
        coinFly: boolean
        coinColor: string
    }>({
        active: false,
        pickaxe: false,
        floatText: null,
        floatColor: '',
        coinFly: false,
        coinColor: '',
    })
    const [flashToken, setFlashToken] = React.useState<"red" | "gold" | null>(null)

    // ── Token Balances (shared hook) ──
    const { redTokens, goldTokens, totalMined, setRedTokens, setGoldTokens, setTotalMined } = useTokenBalances()

    // ── Load habits from Supabase on mount ──
    React.useEffect(() => {
        async function loadHabits() {
            const { data: habitsData } = await supabase
                .from('habits')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
            if (habitsData && habitsData.length > 0) {
                const mapped: HabitConfig[] = habitsData.map(h => ({
                    id: h.id,
                    category: h.category,
                    label: h.label,
                    emoji: h.emoji,
                    unit: h.unit,
                    rates: {
                        red: { repsPerToken: h.red_reps_per_token, minGain: Number(h.red_min_gain) },
                        gold: { repsPerToken: h.gold_reps_per_token, minGain: Number(h.gold_min_gain) },
                    },
                }))
                setHabits(mapped)
                setExercise(mapped[0].id)
            }
            setHabitsLoading(false)
        }
        loadHabits()
    }, [])

    const currentExercise = habits.find(e => e.id === exercise)
    const isFaith = currentExercise?.category === "Faith"

    // Force Gold mode for Faith habits
    React.useEffect(() => {
        if (isFaith && mode === "red") {
            setMode("gold")
        }
    }, [isFaith, mode])

    // ── Red Coin Conversion Logic ──
    const [manualTrigger, setManualTrigger] = React.useState(false)
    const [showDebugExplosion, setShowDebugExplosion] = React.useState(false)

    // Impact Trigger for Balance Bar (controlled by callback)
    const [impactTrigger, setImpactTrigger] = React.useState(false)

    React.useEffect(() => {
        // Just for logging initial status if needed
        const { nextDate } = getPurificationProgress()
        console.log("MiningRig mounted, next purification:", nextDate)
    }, [])

    // ─────────────────────────────────────────────────────────────
    // CONVERSION LOGIC (Called by Vessel)
    // ─────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────
    // 2. CONVERSION LOGIC (Runs on 'Impact')
    // ─────────────────────────────────────────────────────────────
    const handlePurificationImpact = async () => {
        if (redTokens <= 0) return

        const amount = redTokens

        // A. Visual Feedback
        setImpactTrigger(true)
        setTimeout(() => setImpactTrigger(false), 300)

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
        setLogs(prev => [newLog, ...prev].slice(0, 15))

        // D. Database Sync
        const { error } = await supabase.from('user_tokens').upsert({
            user_id: DUMMY_USER_ID,
            red_tokens: 0,
            gold_tokens: goldTokens + amount // Note: closure value might be slightly stale but acceptable here
        }, { onConflict: 'user_id' })

        if (error) console.error("Purification conversion error:", error)

        // E. Reset Trigger State (allow re-trigger later)
        // E. Reset Trigger State (allow re-trigger later)
        // (Vessel handles its own animation reset)
    }

    // ── Render ────────────────────────────────────────────────────────
    console.log("🔥 MiningRig: RENDER", { redTokens })

    if (habitsLoading) return null

    const rate = currentExercise?.rates[mode]
    const tokenOutput = rate ? calculateTokens(quantity, rate.repsPerToken, rate.minGain) : 0

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

        // Always log to Supabase
        const { error: logError } = await supabase.from('mining_logs').insert({
            user_id: DUMMY_USER_ID,
            exercise_type: exercise,
            reps: quantity,
            token_type: mode,
            token_amount: tokenOutput,
            status: tokenOutput <= 0 ? 'warning' : 'success',
        })
        if (logError) console.error('mining_logs insert error:', logError)

        // ── ANIMATION & TIMELINE ──
        const isZero = tokenOutput <= 0
        const animColor = isZero ? "#9CA3AF" : (mode === "red" ? "#F6465D" : "#F0B90B") // Gray if 0
        const animText = isZero ? "0" : `+${tokenOutput} ${tokenLabel}`

        // Phase 1: Pickaxe strike + button shake (0ms)
        // Happens for BOTH success and failure (feedback)
        setMineAnim({
            active: true,
            pickaxe: true,
            floatText: null,
            floatColor: animColor,
            coinFly: false,
            coinColor: animColor,
        })

        // Phase 2: Float text + coin fly (600ms)
        setTimeout(() => {
            setMineAnim(prev => ({
                ...prev,
                floatText: animText,
                coinFly: !isZero, // Only fly coin if > 0
            }))
        }, 600)

        // Phase 3: Bar pulse + update balance (1400ms)
        setTimeout(() => {
            if (!isZero) {
                setFlashToken(mode)
                if (mode === "red") {
                    setRedTokens(prev => prev + tokenOutput)
                } else {
                    setGoldTokens(prev => prev + tokenOutput)
                }
                setTotalMined(prev => prev + 1)
            }

            // Log entry
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                message: isZero
                    ? `⚠ ${quantity} ${currentExercise?.label ?? 'reps'} → 0 ${tokenLabel} (not enough reps)`
                    : `${currentExercise?.emoji} ${quantity} ${currentExercise?.label} → ${tokenOutput} ${tokenLabel}`,
                type: isZero ? "warning" : "success"
            }
            setLogs(prev => [newLog, ...prev].slice(0, 15))
        }, 1400)

        // Cleanup (2200ms)
        setTimeout(() => {
            setMineAnim({
                active: false,
                pickaxe: false,
                floatText: null,
                floatColor: '',
                coinFly: false,
                coinColor: '',
            })
            setFlashToken(null)
        }, 2200)

        // Only update DB if > 0 (to save writes)
        if (!isZero) {
            // Update token balance in Supabase
            const tokenField = mode === "red" ? "red_tokens" : "gold_tokens"
            const newBalance = (mode === "red" ? redTokens : goldTokens) + tokenOutput
            await supabase
                .from('user_tokens')
                .upsert({ user_id: DUMMY_USER_ID, [tokenField]: newBalance }, { onConflict: 'user_id' })

            // Upsert daily stats
            const today = new Date().toISOString().split('T')[0]
            const minedField = mode === "red" ? "red_mined" : "gold_mined"
            const { data: existing } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('user_id', DUMMY_USER_ID)
                .eq('date', today)
                .single()

            if (existing) {
                await supabase
                    .from('daily_stats')
                    .update({
                        [minedField]: Number(existing[minedField] || 0) + tokenOutput,
                        mine_count: (existing.mine_count || 0) + 1,
                    })
                    .eq('user_id', DUMMY_USER_ID)
                    .eq('date', today)
            } else {
                await supabase.from('daily_stats').insert({
                    user_id: DUMMY_USER_ID,
                    date: today,
                    [minedField]: tokenOutput,
                    mine_count: 1,
                })
            }
        }
    }

    return (
        <div className={cn("w-full", className)}>
            {/* DEBUG EXPLOSION OVERLAY */}
            {showDebugExplosion && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 pointer-events-none animate-in zoom-in-50 duration-300">
                    <div className="text-[150px] filter drop-shadow-[0_0_50px_rgba(255,0,0,0.8)] animate-bounce">
                        💣
                    </div>
                </div>
            )}
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

                {/* Main Mining Card */}
                <div className="md:col-span-12">
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

                {/* Purification Vessel */}
                <div className="md:col-span-12">
                    <Card className="bg-brand-gray border-sidebar-border overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 via-orange-500/5 to-brand-gold/5 opacity-30 pointer-events-none" />
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm font-mono uppercase tracking-wider text-gray-400">
                                Purification Vessel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Pass data & actions, Vessel handles the logic */}
                            <PurificationVessel
                                redTokens={redTokens}
                                onPurify={handlePurificationImpact}
                                manualTrigger={manualTrigger}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* System Log */}
                <div className="md:col-span-12">
                    <Card className="bg-brand-gray border-sidebar-border overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                            <MiningLog logs={logs} />
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* MANUAL DEBUG TRIGGER - Signals the Vessel */}
            <PurificationDebug
                onTestAnim={() => {
                    setManualTrigger(true)
                    // Reset trigger after a moment so it can be clicked again
                    setTimeout(() => setManualTrigger(false), 200)
                }}
                showAnim={false} // Debug panel doesn't need to know anim state anymore
            />
        </div>
    )
}
