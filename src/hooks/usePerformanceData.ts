import { useState, useEffect } from 'react'
import { supabase, DUMMY_USER_ID } from '@/lib/supabase'

export interface DailyPerformance {
    day: string
    mining: number
    burn: number
}

export interface PerformanceDataState {
    data: DailyPerformance[]
    loading: boolean
}

// Helper to get the last N days including today
function getLastNDays(n: number) {
    const dates = [];

    // For "Today", return 2 points with the same date so Recharts draws a flat line
    if (n <= 1) {
        const d = new Date();
        const dateStr = d.toISOString().split('T')[0];
        dates.push({ dateStr, dayName: '00:00' });
        dates.push({ dateStr, dayName: 'Now' });
        return dates;
    }

    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        let dayName: string;
        if (n <= 7) {
            dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            dayName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        dates.push({ dateStr, dayName });
    }
    return dates;
}

export function usePerformanceData(days: number = 7) {
    const [state, setState] = useState<PerformanceDataState>({
        data: [],
        loading: true
    })

    useEffect(() => {
        let mounted = true;

        async function load() {
            setState(prev => ({ ...prev, loading: true }));
            try {
                const daysToFetch = getLastNDays(days);
                const startDate = daysToFetch[0].dateStr;
                const endDate = daysToFetch[daysToFetch.length - 1].dateStr;

                const { data: rawStats, error } = await supabase
                    .from('daily_stats')
                    .select('date, red_mined, gold_mined, red_burned, gold_burned')
                    .eq('user_id', DUMMY_USER_ID)
                    .gte('date', startDate)
                    .lte('date', endDate);

                if (error) {
                    console.error("PERFORMANCE_CHART: Fetch error:", error);
                    throw error;
                }

                // Map database results into a dictionary for quick lookup
                const statsMap: Record<string, { mining: number, burn: number }> = {};
                if (rawStats) {
                    rawStats.forEach(row => {
                        const totalMined = (Number(row.red_mined) || 0) + (Number(row.gold_mined) || 0);
                        const totalBurned = (Number(row.red_burned) || 0) + (Number(row.gold_burned) || 0);
                        statsMap[row.date] = { mining: totalMined, burn: totalBurned };
                    });
                }

                // Construct final array ensuring all days exist even if no data (filling with 0s)
                const chartData: DailyPerformance[] = daysToFetch.map(d => {
                    const stats = statsMap[d.dateStr] || { mining: 0, burn: 0 };
                    return {
                        day: d.dayName,
                        mining: stats.mining,
                        burn: stats.burn
                    };
                });

                if (mounted) {
                    setState({ data: chartData, loading: false });
                }

            } catch (e) {
                console.error("PERFORMANCE_CHART: Fatal error:", e);
                if (mounted) setState(prev => ({ ...prev, loading: false }));
            }
        }

        load();

        // Allow external triggers to force refresh chart (e.g., after mining or buying)
        const handleUpdate = () => { if (mounted) load(); };
        window.addEventListener('portfolio-updated', handleUpdate);

        return () => {
            mounted = false;
            window.removeEventListener('portfolio-updated', handleUpdate);
        };
    }, [days]);

    return state;
}
