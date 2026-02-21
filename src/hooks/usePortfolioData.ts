import { useState, useEffect } from 'react'
import { supabase, DUMMY_USER_ID } from '@/lib/supabase'

export interface PortfolioData {
    pushupCount: number
    pushupTrend: number
    loading: boolean
}

export function usePortfolioData() {
    const [data, setData] = useState<PortfolioData>({
        pushupCount: 0,
        pushupTrend: 0,
        loading: true
    })

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                console.log("PORTFOLIO: Starting load (Pushups via Aggregates)...")

                // 1. Fetch ALL-TIME Stats (Efficient O(1) from user_stats)
                // We use maybeSingle() because user might not exist yet if script failed backfill
                const { data: stats, error: statsError } = await supabase
                    .from('user_stats')
                    .select('total_pushups')
                    .eq('user_id', DUMMY_USER_ID)
                    .maybeSingle()

                if (statsError) {
                    console.error("PORTFOLIO: Stats fetch error:", statsError)
                }

                // 2. Fetch TODAY'S Logs for Trend (+X Today)
                // Filter specifically for pushups. This query is light (limited by date).
                const todayStr = new Date().toISOString().split('T')[0]
                const { data: todayLogs, error: logError } = await supabase
                    .from('mining_logs')
                    .select('reps')
                    .eq('user_id', DUMMY_USER_ID)
                    .gte('created_at', `${todayStr}T00:00:00`)
                    .ilike('exercise_type', '%push%')

                if (logError) console.error("PORTFOLIO: Today logs error:", logError)

                // Calculate Trend Client-side (Sum of today's logs)
                const pushupToday = todayLogs?.reduce((sum, log) => sum + log.reps, 0) || 0;

                // Total is from DB Aggregates (or 0 if new)
                const pushupTotal = stats?.total_pushups || 0;

                if (mounted) {
                    setData({
                        pushupCount: pushupTotal,
                        pushupTrend: pushupToday,
                        loading: false
                    })
                }

            } catch (e) {
                console.error("PORTFOLIO: Fatal error:", e)
                if (mounted) setData(prev => ({ ...prev, loading: false }))
            }
        }

        load()

        const timeout = setTimeout(() => {
            if (mounted) {
                setData(prev => {
                    if (prev.loading) {
                        return { ...prev, loading: false }
                    }
                    return prev
                })
            }
        }, 5000)

        const handleUpdate = () => {
            if (mounted) {
                // Optionally set loading state again if desired, but for smooth background refresh we might not want to
                load()
            }
        }
        window.addEventListener('portfolio-updated', handleUpdate)

        return () => {
            mounted = false
            clearTimeout(timeout)
            window.removeEventListener('portfolio-updated', handleUpdate)
        }
    }, [])

    return data
}
