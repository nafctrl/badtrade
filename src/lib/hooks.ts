"use client"

import * as React from "react"
import { supabase, DUMMY_USER_ID } from "@/lib/supabase"

interface TokenBalances {
    redTokens: number
    goldTokens: number
    blackTokens: number
    totalMined: number
    setRedTokens: React.Dispatch<React.SetStateAction<number>>
    setGoldTokens: React.Dispatch<React.SetStateAction<number>>
    setBlackTokens: React.Dispatch<React.SetStateAction<number>>
    setTotalMined: React.Dispatch<React.SetStateAction<number>>
    loading: boolean
}

export function useTokenBalances(): TokenBalances {
    const [redTokens, setRedTokens] = React.useState(0)
    const [goldTokens, setGoldTokens] = React.useState(0)
    const [blackTokens, setBlackTokens] = React.useState(0)
    const [totalMined, setTotalMined] = React.useState(0)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('user_tokens')
                .select('red_tokens, gold_tokens, black_tokens')
                .eq('user_id', DUMMY_USER_ID)
                .single()
            if (data) {
                setRedTokens(Number(data.red_tokens))
                setGoldTokens(Number(data.gold_tokens))
                setBlackTokens(Number(data.black_tokens || 0))
            }

            const today = new Date().toISOString().split('T')[0]
            const { data: stats } = await supabase
                .from('daily_stats')
                .select('mine_count')
                .eq('user_id', DUMMY_USER_ID)
                .eq('date', today)
                .single()
            if (stats) {
                setTotalMined(stats.mine_count)
            }

            setLoading(false)
        }
        load()
    }, [])

    return {
        redTokens, goldTokens, blackTokens, totalMined,
        setRedTokens, setGoldTokens, setBlackTokens, setTotalMined,
        loading,
    }
}
