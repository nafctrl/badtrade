"use client"

import * as React from "react"

// ── Types ─────────────────────────────────────────────────────────
export interface MineAnimState {
    active: boolean
    pickaxe: boolean
    floatText: string | null
    floatColor: string
    coinFly: boolean
    coinColor: string
}

const INITIAL_ANIM: MineAnimState = {
    active: false,
    pickaxe: false,
    floatText: null,
    floatColor: '',
    coinFly: false,
    coinColor: '',
}

// ── Hook ──────────────────────────────────────────────────────────
export function useMineAnimation() {
    const [mineAnim, setMineAnim] = React.useState<MineAnimState>(INITIAL_ANIM)
    const [flashToken, setFlashToken] = React.useState<"red" | "gold" | null>(null)

    /**
     * Triggers the full 4-phase mine animation timeline.
     * 
     * @param mode - "red" or "gold"
     * @param tokenOutput - number of tokens earned (0 = failure animation)
     * @param onPhase3 - callback fired at Phase 3 (1400ms) for balance updates + log entry
     */
    const triggerMineAnimation = React.useCallback((
        mode: "red" | "gold",
        tokenOutput: number,
        onPhase3: () => void,
    ) => {
        const isZero = tokenOutput <= 0
        const tokenLabel = mode === "red" ? "RT" : "GT"
        const animColor = isZero ? "#9CA3AF" : (mode === "red" ? "#F6465D" : "#F0B90B")
        const animText = isZero ? "0" : `+${tokenOutput} ${tokenLabel}`

        // Phase 1: Pickaxe strike + button shake (0ms)
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
                coinFly: !isZero,
            }))
        }, 600)

        // Phase 3: Bar pulse + balance update callback (1400ms)
        setTimeout(() => {
            if (!isZero) {
                setFlashToken(mode)
            }
            onPhase3()
        }, 1400)

        // Phase 4: Cleanup (2200ms)
        setTimeout(() => {
            setMineAnim(INITIAL_ANIM)
            setFlashToken(null)
        }, 2200)
    }, [])

    return {
        mineAnim,
        flashToken,
        triggerMineAnimation,
    }
}
