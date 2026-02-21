"use client"

import { Terminal } from "lucide-react"

export interface SpendingEntry {
    id: string
    timestamp: string
    message: string
    type: "purchase" | "info"
}

interface SpendingLogProps {
    logs: SpendingEntry[]
}

export function SpendingLog({ logs }: SpendingLogProps) {
    return (
        <div className="w-full">
            <div className="flex items-center gap-2 text-xs text-zinc-600 mb-2 font-mono uppercase tracking-wider">
                <Terminal className="w-3 h-3" />
                <div>Spending Log</div>
            </div>

            <div className="font-mono text-xs space-y-1.5 opacity-80 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-1">
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                        <span className={
                            log.type === "purchase" ? "text-red-400" : "text-zinc-400"
                        }>
                            {">"} {log.message}
                        </span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-zinc-700 italic">{">"} No transactions yet...</div>
                )}
            </div>
        </div>
    )
}
