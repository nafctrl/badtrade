"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuantityInputProps {
    value: number
    onChange: (value: number) => void
    max?: number
    unit?: string
}

export function QuantityInput({ value, onChange, max = 100, unit = "REPS" }: QuantityInputProps) {
    const handleIncrement = () => onChange(Math.min(value + 1, max))
    const handleDecrement = () => onChange(Math.max(value - 1, 0))
    const handlePreset = (amount: number) => onChange(Math.min(value + amount, max))

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-4 w-full max-w-sm justify-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white transition-colors"
                    onClick={handleDecrement}
                >
                    <Minus className="w-6 h-6" />
                </Button>

                <div className="flex-1 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const val = parseInt(e.target.value)
                            if (!isNaN(val) && val >= 0 && val <= max) onChange(val)
                        }}
                        className="relative w-full bg-zinc-950 text-center text-4xl font-mono font-bold py-4 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all text-white"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-[10px] uppercase tracking-wider">
                        {unit}
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white transition-colors"
                    onClick={handleIncrement}
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 items-center w-full">
                <button
                    onClick={() => onChange(0)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all text-xs font-mono"
                >
                    0
                </button>
                <button
                    onClick={() => onChange(10)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all text-xs font-mono"
                >
                    10
                </button>


                <button
                    onClick={() => handlePreset(5)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all text-xs font-mono"
                >
                    +5
                </button>
                <button
                    onClick={() => handlePreset(10)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all text-xs font-mono"
                >
                    +10
                </button>

                <button
                    onClick={() => onChange(max)}
                    className="px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-yellow-500/80 hover:text-yellow-400 hover:border-yellow-900/30 hover:bg-yellow-900/10 transition-all text-xs font-mono flex items-center gap-1"
                >
                    <Maximize className="w-3 h-3" />
                    MAX
                </button>
            </div>
        </div>
    )
}
