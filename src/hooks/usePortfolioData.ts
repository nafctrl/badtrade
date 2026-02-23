import { useState, useEffect } from 'react'
import { supabase, DUMMY_USER_ID } from '@/lib/supabase'

export interface PortfolioData {
    pushupCount: number
    pushupTrend: number
    pullupCount: number
    pullupTrend: number
    loading: boolean
}

export function usePortfolioData() {
    const [data, setData] = useState<PortfolioData>({
        pushupCount: 0,
        pushupTrend: 0,
        pullupCount: 0,
        pullupTrend: 0,
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
                    .select('total_pushups, total_pullups')
                    .eq('user_id', DUMMY_USER_ID)
                    .maybeSingle()

                if (statsError) {
                    console.error("PORTFOLIO: Stats fetch error:", statsError)
                }

                // 2. Fetch TODAY'S Logs for Trend (+X Today)
                // Filter specifically for pushups. This query is light (limited by date).
                // Fetch ALL today logs (for both push and pull)
                const todayStr = new Date().toISOString().split('T')[0]
                const { data: todayLogs, error: logError } = await supabase
                    .from('mining_logs')
                    .select('reps, exercise_type')
                    .eq('user_id', DUMMY_USER_ID)
                    .gte('created_at', `${todayStr}T00:00:00`)

                if (logError) console.error("PORTFOLIO: Today logs error:", logError)

                // Calculate Trend Client-side
                const pushupToday = todayLogs?.filter(log => log.exercise_type.toLowerCase().includes('push')).reduce((sum, log) => sum + log.reps, 0) || 0;
                const pullupToday = todayLogs?.filter(log => log.exercise_type.toLowerCase().includes('pull')).reduce((sum, log) => sum + log.reps, 0) || 0;

                // Total is from DB Aggregates (or 0 if new)
                const pushupTotal = stats?.total_pushups || 0;
                const pullupTotal = stats?.total_pullups || 0;

                if (mounted) {
                    setData({
                        pushupCount: pushupTotal,
                        pushupTrend: pushupToday,
                        pullupCount: pullupTotal,
                        pullupTrend: pullupToday,
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
