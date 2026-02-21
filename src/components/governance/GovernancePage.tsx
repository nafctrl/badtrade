"use client"

import * as React from "react"
import { MarketplaceAdmin } from "./MarketplaceAdmin"
import { HabitAdmin } from "./HabitAdmin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Store, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

interface GovernancePageProps {
    className?: string
}

export function GovernancePage({ className }: GovernancePageProps) {
    const [activeTab, setActiveTab] = React.useState<"marketplace" | "habits">("marketplace")

    const tabs = [
        { id: "marketplace" as const, label: "Marketplace", icon: Store },
        { id: "habits" as const, label: "Habits", icon: Dumbbell },
    ]

    return (
        <div className={cn("w-full", className)}>
            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-gray-500" />
                    <div>
                        <h1 className="text-lg font-mono font-bold text-white tracking-tight">Governance</h1>
                        <p className="text-[11px] font-mono text-gray-600">Protocol configuration & economy management</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-mono text-sm transition-all duration-200",
                                activeTab === tab.id
                                    ? "border-gray-500 bg-white/5 text-white"
                                    : "border-sidebar-border bg-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <Card className="bg-brand-gray border-sidebar-border overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-mono uppercase tracking-wider text-gray-400">
                            {activeTab === "marketplace" ? "Marketplace Items" : "Good Habits"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        {activeTab === "marketplace" ? <MarketplaceAdmin /> : <HabitAdmin />}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
