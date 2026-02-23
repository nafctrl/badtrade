'use client'

import { NetWorthCard } from "@/components/dashboard/NetWorthCard"
import { KPIGrid } from "@/components/dashboard/KPIGrid"
import { VestingTimer } from "@/components/dashboard/VestingTimer"
import { PerformanceChart } from "@/components/dashboard/PerformanceChart"
import { Button } from "@/components/ui/button"
import { History, LogOut } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { usePortfolioData } from "@/hooks/usePortfolioData"

export default function PortfolioPage() {
    // Force rebuild: v3
    const portfolioData = usePortfolioData()
    console.log("PortfolioPage Rendered. Data:", portfolioData)

    return (
        <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-gold/30">
            <main className="lg:pl-52 max-w-[1600px] mx-auto px-4 lg:px-8 py-8">

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span className="w-2 h-8 bg-brand-gold rounded-full inline-block" />
                            Command Center
                        </h2>
                        <p className="text-gray-500 font-mono text-sm mt-1 ml-4">
                            Protocol Status: <span className="text-brand-green">ONLINE</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-sidebar-border bg-brand-gray hover:bg-sidebar-accent text-gray-400 hover:text-white"
                        >
                            <History className="w-4 h-4 mr-2" />
                            Audit Log
                        </Button>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-sidebar-border bg-brand-gray hover:bg-red-950/50 text-gray-400 hover:text-red-400"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to terminate the secure session?")) {
                                            window.dispatchEvent(new Event("bt-logout"))
                                        }
                                    }}
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="end" className="bg-red-950/90 border-red-500/30 text-red-200">
                                <p>Terminate Session</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Net Worth — spans 8/12 on large screens */}
                    <div className="md:col-span-12 lg:col-span-8 xl:col-span-9">
                        <NetWorthCard />
                    </div>

                    {/* KPI Grid — 4 stat cards in 2×2 */}
                    <div className="md:col-span-12 lg:col-span-4 xl:col-span-3 h-full">
                        <div className="h-full">
                            <KPIGrid
                                pushupCount={portfolioData.pushupCount}
                                pushupTrend={portfolioData.pushupTrend}
                                pullupCount={portfolioData.pullupCount}
                                pullupTrend={portfolioData.pullupTrend}
                                loading={portfolioData.loading}
                            />
                        </div>
                    </div>

                    {/* Vesting Timer */}
                    <div className="md:col-span-12 lg:col-span-4 xl:col-span-3 h-full">
                        <VestingTimer />
                    </div>

                    {/* Performance Chart */}
                    <div className="md:col-span-12 lg:col-span-8 xl:col-span-9 h-full">
                        <PerformanceChart />
                    </div>

                </div>

            </main>
        </div>
    )
}
