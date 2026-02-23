'use client';

import { CommandDeck } from "@/components/layout/CommandDeck";
import { LoginGate } from "@/components/auth/LoginGate";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { VestingTimer } from "@/components/dashboard/VestingTimer";
import { EarnTab } from "@/components/earn/EarnTab";
import { MarketplacePage } from "@/components/marketplace/MarketplacePage";
import { GovernancePage } from "@/components/governance/GovernancePage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Zap, History, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { usePortfolioData } from "@/hooks/usePortfolioData";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'mining' | 'exchange' | 'governance'>('portfolio');
  const portfolioData = usePortfolioData(); // Fetch real data for Home URL as well

  return (
    <LoginGate>
      <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-gold/30">

        {/* Navigation */}
        <CommandDeck
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSettingsClick={() => console.log("Open Protocol Configuration")}
        />

        {/* Main Content Area */}
        <main className="lg:pl-52 pb-20 lg:pb-8 pt-16 lg:pt-8 px-4 lg:px-8 max-w-[1600px] mx-auto transition-all duration-300">

          {/* Desktop Header */}
          <header className="hidden lg:flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-brand-gold rounded-full inline-block"></span>
                Command Center
              </h2>
              <p className="text-gray-500 font-mono text-sm mt-1 ml-4">Protocol Status: <span className="text-brand-green">ONLINE</span></p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-sidebar-border bg-brand-gray hover:bg-sidebar-accent text-gray-400 hover:text-white">
                <History className="w-4 h-4 mr-2" /> Audit Log
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-sidebar-border bg-brand-gray hover:bg-red-950/50 text-gray-400 hover:text-red-400"
                    onClick={() => {
                      if (confirm("Are you sure you want to terminate the secure session?")) {
                        window.dispatchEvent(new Event("bt-logout"));
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

          {/* Tab Content: Portfolio */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Section A: Net Worth Header (Full Width) */}
              <div className="md:col-span-12 lg:col-span-8 xl:col-span-9 order-1">
                <NetWorthCard />
              </div>

              {/* Section D: KPI Grid (Mobile: Stack, Desktop: Top Right) */}
              <div className="md:col-span-12 lg:col-span-4 xl:col-span-3 order-3 lg:order-2 h-full">
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

              {/* Section B: Smart Contract Status / Vesting (Medium) */}
              <div className="md:col-span-12 lg:col-span-4 xl:col-span-3 order-2 lg:order-3">
                <VestingTimer />
              </div>

              {/* Section C: Performance Chart (Large) */}
              <div className="md:col-span-12 lg:col-span-8 xl:col-span-9 order-4">
                <PerformanceChart />
              </div>

            </div>
          )}

          {/* Tab Content: Mining Terminal */}
          {activeTab === 'mining' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
              <EarnTab className="py-8" />
            </div>
          )}

          {/* Tab Content: Marketplace */}
          {activeTab === 'exchange' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
              <MarketplacePage className="py-8" />
            </div>
          )}

          {/* Tab Content: Governance */}
          {activeTab === 'governance' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
              <GovernancePage className="py-8" />
            </div>
          )}

        </main>
      </div>
    </LoginGate>
  );
}
