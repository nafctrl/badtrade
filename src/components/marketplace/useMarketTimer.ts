"use client"

import * as React from "react"

export interface TimerStatus {
    isActive: boolean
    isExpired: boolean
    isPaused: boolean
    remaining: number // ms
    progress: number  // 0-100
}

export function useMarketTimer(expiresAt: string | null, durationMinutes: number | null, pausedRemainingMs: number | null = null) {
    const [status, setStatus] = React.useState<TimerStatus>({
        isActive: false,
        isExpired: false,
        isPaused: false,
        remaining: 0,
        progress: 0
    })

    React.useEffect(() => {
        if (!durationMinutes) {
            setStatus({ isActive: false, isExpired: false, isPaused: false, remaining: 0, progress: 0 })
            return
        }

        const durationMs = durationMinutes * 60 * 1000

        // Paused state logic
        if (pausedRemainingMs !== null && pausedRemainingMs !== undefined) {
            const progress = durationMs > 0 ? (pausedRemainingMs / durationMs) * 100 : 0
            setStatus({
                isActive: true,
                isExpired: false,
                isPaused: true,
                remaining: pausedRemainingMs,
                progress
            })
            // Do not start an interval since we're frozen in time
            return
        }

        if (!expiresAt) {
            setStatus({ isActive: false, isExpired: false, isPaused: false, remaining: 0, progress: 0 })
            return
        }

        const expireTime = new Date(expiresAt).getTime()

        const tick = () => {
            const now = Date.now()
            const remaining = Math.max(expireTime - now, 0)
            const progress = durationMs > 0 ? (remaining / durationMs) * 100 : 0

            if (remaining > 0) {
                setStatus({
                    isActive: true,
                    isExpired: false,
                    isPaused: false,
                    remaining,
                    progress
                })
            } else {
                setStatus({
                    isActive: false,
                    isExpired: true,
                    isPaused: false,
                    remaining: 0,
                    progress: 0
                })
            }
        }

        tick() // Initial calculation
        const intervalId = setInterval(tick, 1000)

        return () => clearInterval(intervalId)
    }, [expiresAt, durationMinutes, pausedRemainingMs])

    return status
}
