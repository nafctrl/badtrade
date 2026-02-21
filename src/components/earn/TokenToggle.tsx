"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TokenToggleProps {
    mode: "red" | "gold"
    onToggle: (mode: "red" | "gold") => void
    disableRed?: boolean
}

const SARCASTIC_WARNINGS = [
    "RT is for the weak of spirit.",
    "Trying to corrupt your soul?",
    "Faith yields Gold, not Red.",
    "Materialism? In THIS economy?",
    "Your faith is not for sale.",
    "Focus on the spiritual, heathen.",
    "Submit to the Gold standard.",
]

export function TokenToggle({ mode, onToggle, disableRed }: TokenToggleProps) {
    const [warning, setWarning] = React.useState<string | null>(null)
    const timeoutRef = React.useRef<NodeJS.Timeout>(null)

    const handleRedClick = () => {
        if (disableRed) {
            // Show random sarcasm
            const randomMsg = SARCASTIC_WARNINGS[Math.floor(Math.random() * SARCASTIC_WARNINGS.length)]
            setWarning(randomMsg)

            // Clear existing timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current)

            // Hide after 2s
            timeoutRef.current = setTimeout(() => setWarning(null), 2500)
            return
        }
        onToggle("red")
    }

    return (
        <div className="relative">
            {/* Sarcastic Warning Bubble */}
            {warning && (
                <div className="absolute -top-12 left-0 z-50 whitespace-nowrap bg-brand-black text-brand-gold border border-brand-gold/30 px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="mr-1">⚡</span> {warning}
                    <div className="absolute bottom-[-5px] left-4 w-2.5 h-2.5 bg-brand-black border-r border-b border-brand-gold/30 rotate-45" />
                </div>
            )}

            <div className="relative p-0.5 bg-brand-black/60 rounded-full border border-sidebar-border flex items-center w-fit">
                <div
                    className={cn(
                        "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-300 ease-out",
                        mode === "red"
                            ? "left-0.5 bg-red-600 shadow-[0_0_12px_rgba(246,70,93,0.5)]"
                            : "left-[calc(50%+1px)] bg-yellow-500 shadow-[0_0_12px_rgba(240,185,11,0.5)]"
                    )}
                />

                <button
                    onClick={handleRedClick}
                    className={cn(
                        "relative z-10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 rounded-full cursor-pointer",
                        mode === "red" ? "text-white" : "text-gray-500 hover:text-gray-300",
                        disableRed && "opacity-50 cursor-not-allowed hover:text-gray-500"
                    )}
                >
                    RT
                </button>

                <button
                    onClick={() => onToggle("gold")}
                    className={cn(
                        "relative z-10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 rounded-full cursor-pointer",
                        mode === "gold" ? "text-black font-extrabold" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    GT
                </button>
            </div>
        </div>
    )
}
