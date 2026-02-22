"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────
export interface HabitConfig {
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

export function calculateTokens(reps: number, repsPerToken: number, minGain: number): number {
    const raw = reps / repsPerToken
    if (raw < minGain) return 0
    // Fix JS floating point precision issues (e.g. 0.3 / 0.1 = 2.9999999999999996)
    // Add small epsilon (1e-9) to round up those trailing nines before floor
    const steps = Math.floor((raw / minGain) + 1e-9)
    return Number((steps * minGain).toFixed(4))
}

// ── Hook ──────────────────────────────────────────────────────────
export function useMiningHabits() {
    const [mode, setMode] = React.useState<"red" | "gold">("red")
    const [habits, setHabits] = React.useState<HabitConfig[]>([])
    const [exercise, setExercise] = React.useState<string>("")
    const [quantity, setQuantity] = React.useState(10)
    const [habitsLoading, setHabitsLoading] = React.useState(true)

    // Load habits from Supabase on mount
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

    // Derived state
    const currentExercise = habits.find(e => e.id === exercise)
    const isFaith = currentExercise?.category === "Faith"

    // Force Gold mode for Faith habits
    React.useEffect(() => {
        if (isFaith && mode === "red") {
            setMode("gold")
        }
    }, [isFaith, mode])

    const rate = currentExercise?.rates[mode]
    const tokenOutput = rate ? calculateTokens(quantity, rate.repsPerToken, rate.minGain) : 0

    return {
        // State
        mode, setMode,
        habits,
        exercise, setExercise,
        quantity, setQuantity,
        habitsLoading,
        // Derived
        currentExercise,
        isFaith,
        rate,
        tokenOutput,
    }
}
