"use client"

import { supabase, DUMMY_USER_ID } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────
export interface MineSubmission {
    exerciseId: string
    reps: number
    mode: "red" | "gold"
    tokenOutput: number
    /** Current token balances needed for DB upsert */
    currentRedTokens: number
    currentGoldTokens: number
}

// ── Hook ──────────────────────────────────────────────────────────
export function useMiningActions() {

    /**
     * Handles all Supabase DB writes for a mine action:
     * 1. Inserts mining_log
     * 2. Upserts user_tokens balance
     * 3. Upserts daily_stats
     * 4. Dispatches portfolio-updated event
     *
     * NOTE: Local state updates (setRedTokens etc.) are NOT done here —
     * they happen in the animation Phase 3 callback for correct timing.
     */
    async function submitMine(submission: MineSubmission) {
        const { exerciseId, reps, mode, tokenOutput, currentRedTokens, currentGoldTokens } = submission
        const isZero = tokenOutput <= 0

        // 1. Always insert mining_log
        const { error: logError } = await supabase.from('mining_logs').insert({
            user_id: DUMMY_USER_ID,
            exercise_type: exerciseId,
            reps,
            token_type: mode,
            token_amount: tokenOutput,
            status: isZero ? 'warning' : 'success',
        })
        if (logError) console.error('mining_logs insert error:', logError)

        // 2+3. Only update DB balances & stats if > 0
        if (!isZero) {
            // Update token balance in Supabase
            const tokenField = mode === "red" ? "red_tokens" : "gold_tokens"
            const newBalance = (mode === "red" ? currentRedTokens : currentGoldTokens) + tokenOutput
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

        // 4. Update user_stats if exercise is read-quran
        if (exerciseId === 'read-quran' && reps > 0) {
            const { data: statsData } = await supabase
                .from('user_stats')
                .select('total_quran')
                .eq('user_id', DUMMY_USER_ID)
                .maybeSingle()

            if (statsData) {
                await supabase
                    .from('user_stats')
                    .update({ total_quran: Number(statsData.total_quran || 0) + reps })
                    .eq('user_id', DUMMY_USER_ID)
            } else {
                await supabase.from('user_stats').insert({
                    user_id: DUMMY_USER_ID,
                    total_quran: reps,
                    total_pushups: 0
                })
            }
        }

        // 5. Notify global listeners
        window.dispatchEvent(new Event('portfolio-updated'))
    }

    return { submitMine }
}
