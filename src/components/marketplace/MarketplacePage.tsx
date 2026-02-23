"use client"

import * as React from "react"
import { TokenBalanceBar } from "@/components/earn/TokenBalanceBar"
import { MarketCatalog } from "./MarketCatalog"
import { PurchaseConfirmDialog } from "./PurchaseConfirmDialog"
import { SpendingLog, SpendingEntry } from "./SpendingLog"
import { InventorySection } from "../inventory/InventorySection"
import { useInventory } from "../inventory/useInventory"
import { MarketItemData } from "./MarketItem"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Hexagon } from "lucide-react"
import { cn } from "@/lib/utils"
// Use the shared token config for the ghost clone icon
const TOKEN_CONFIG: Record<string, { label: string; color: string; fill: string; glow: string }> = {
    red: { label: "RT", color: "#F6465D", fill: "rgba(246,70,93,0.25)", glow: "rgba(246,70,93,0.4)" },
    gold: { label: "GT", color: "#F0B90B", fill: "rgba(240,185,11,0.25)", glow: "rgba(240,185,11,0.4)" },
    black: { label: "BT", color: "#B0B8C1", fill: "rgba(176,184,193,0.2)", glow: "rgba(176,184,193,0.3)" },
}
import { supabase, DUMMY_USER_ID } from "@/lib/supabase"
import { useTokenBalances } from "@/lib/hooks"

interface MarketplacePageProps {
    className?: string
}

export function MarketplacePage({ className }: MarketplacePageProps) {
    const { redTokens, goldTokens, blackTokens, totalMined, setRedTokens, setGoldTokens, setBlackTokens } = useTokenBalances()

    const [selectedItem, setSelectedItem] = React.useState<MarketItemData | null>(null)
    const [selectedItemRect, setSelectedItemRect] = React.useState<Pick<DOMRect, 'top' | 'left' | 'width' | 'height'> | null>(null)
    const [showConfirm, setShowConfirm] = React.useState(false)
    const [catalogItems, setCatalogItems] = React.useState<MarketItemData[]>([])
    const [catalogLoading, setCatalogLoading] = React.useState(true)
    const [purchasedClone, setPurchasedClone] = React.useState<MarketItemData | null>(null)
    const [purchasedCloneRect, setPurchasedCloneRect] = React.useState<Pick<DOMRect, 'top' | 'left' | 'width' | 'height'> | null>(null)
    const [logs, setLogs] = React.useState<SpendingEntry[]>([
        { id: "1", timestamp: new Date().toISOString().replace('T', ' ').split('.')[0], message: "Marketplace loaded", type: "info" },
    ])

    // Active product timer logic removed for future rework

    // Inventory
    const inventory = useInventory()

    // Load catalog from Supabase
    React.useEffect(() => {
        async function loadCatalog() {
            const { data: itemsData } = await supabase
                .from('marketplace_items')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
            if (itemsData) {
                const mapped: MarketItemData[] = itemsData.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    cost: Number(item.cost),
                    tokenType: item.token_type as MarketItemData['tokenType'],
                    emoji: item.emoji,
                    stock: item.stock as number | null,
                    duration_minutes: item.duration_minutes as number | null ?? null,
                }))
                setCatalogItems(mapped)
            }
            setCatalogLoading(false)
        }
        loadCatalog()
    }, [])

    const handleBuyClick = (item: MarketItemData, rect?: DOMRect) => {
        setSelectedItem(item)
        if (rect) {
            setSelectedItemRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
        } else {
            setSelectedItemRect(null)
        }
        setShowConfirm(true)
    }

    const handleConfirmPurchase = async () => {
        if (!selectedItem) return
        setShowConfirm(false)

        const tokenField = selectedItem.tokenType === "red" ? "red_tokens"
            : selectedItem.tokenType === "gold" ? "gold_tokens"
                : "black_tokens"

        const currentBalance = selectedItem.tokenType === "red" ? redTokens
            : selectedItem.tokenType === "gold" ? goldTokens
                : blackTokens

        const newBalance = currentBalance - selectedItem.cost

        // Update user balances
        await supabase
            .from('user_tokens')
            .upsert({ user_id: DUMMY_USER_ID, [tokenField]: newBalance }, { onConflict: 'user_id' })

        // Update daily_stats for burn rate
        if (selectedItem.tokenType === 'red' || selectedItem.tokenType === 'gold') {
            const todayStr = new Date().toISOString().split('T')[0];
            const statField = selectedItem.tokenType === 'red' ? 'red_burned' : 'gold_burned';

            // Note: Since upsert doesn't easily do increment in Supabase without RPC, we can fetch, then increment.
            const { data: currentStats } = await supabase
                .from('daily_stats')
                .select(statField)
                .eq('user_id', DUMMY_USER_ID)
                .eq('date', todayStr)
                .maybeSingle();

            const currentBurn = currentStats ? ((currentStats as Record<string, number>)[statField] || 0) : 0;
            const newBurn = currentBurn + selectedItem.cost;

            await supabase
                .from('daily_stats')
                .upsert({
                    user_id: DUMMY_USER_ID,
                    date: todayStr,
                    [statField]: newBurn
                }, { onConflict: 'user_id,date' });
        }

        // Update local state
        if (selectedItem.tokenType === "red") setRedTokens(newBalance)
        else if (selectedItem.tokenType === "gold") setGoldTokens(newBalance)
        else setBlackTokens(newBalance)

        const tokenLabel = selectedItem.tokenType === "red" ? "RT"
            : selectedItem.tokenType === "gold" ? "GT" : "BT"

        const newLog: SpendingEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
            message: `🔥 Burned ${selectedItem.cost} ${tokenLabel} → ${selectedItem.emoji} ${selectedItem.name}`,
            type: "purchase"
        }
        setLogs(prev => [newLog, ...prev].slice(0, 15))

        if (selectedItem.id === "bt-1") {
            // Direct Black Token Purchase flow
            const rewardAmount = 1
            const newBlackBalance = blackTokens + rewardAmount

            // Increment the black tokens specifically
            await supabase
                .from('user_tokens')
                .upsert({ user_id: DUMMY_USER_ID, black_tokens: newBlackBalance }, { onConflict: 'user_id' })

            // Update local state directly
            setBlackTokens(newBlackBalance)

            const specialLog: SpendingEntry = {
                id: Date.now().toString() + '-special',
                timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                message: `💎 Received ${rewardAmount} Black Token instantly`,
                type: "info"
            }
            setLogs(prev => [specialLog, ...prev].slice(0, 15))
        } else {
            // Normal flow: Add item to inventory
            const added = await inventory.addItem(selectedItem)
            if (added) {
                const inventoryLog: SpendingEntry = {
                    id: Date.now().toString() + '-inv',
                    timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                    message: `📦 Added ${selectedItem.emoji} ${selectedItem.name} to Storage Locker`,
                    type: "info"
                }
                setLogs(prev => [inventoryLog, ...prev].slice(0, 15))
            }
        }

        const confirmedItem = selectedItem
        const confirmedRect = selectedItemRect
        setSelectedItem(null)
        setSelectedItemRect(null)
        setPurchasedClone(confirmedItem)
        setPurchasedCloneRect(confirmedRect)
        setTimeout(() => {
            setPurchasedClone(null)
            setPurchasedCloneRect(null)
        }, 500) // Clear clone after animation finishes
    }

    // handleStopEarly and handleDismissExpired removed for future rework

    return (
        <div className={cn("relative w-full overflow-x-clip", className)}>
            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Balance Bar (shared component) */}
                <TokenBalanceBar
                    redTokens={redTokens}
                    goldTokens={goldTokens}
                    blackTokens={blackTokens}
                    totalMined={totalMined}
                />

                {/* Warning Banner */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/20 border border-red-900/20">
                    <ShieldAlert className="w-5 h-5 text-red-500/70 shrink-0 animate-pulse" />
                    <p className="text-[11px] font-mono text-red-400/60 leading-relaxed">
                        Every token you spend here was earned through sweat and discipline. Think twice before you burn them.
                    </p>
                </div>

                {/* Catalog Grid */}
                <Card className="bg-brand-gray border-sidebar-border overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-950/5 via-transparent to-transparent pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-gray-400">
                            <ShieldAlert className="w-4 h-4 text-red-500/50" />
                            Black Market
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        {catalogLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-40 rounded-xl bg-brand-black/40 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <MarketCatalog
                                items={catalogItems}
                                redTokens={redTokens}
                                goldTokens={goldTokens}
                                blackTokens={blackTokens}
                                onBuy={handleBuyClick}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Inventory Section */}
                <InventorySection
                    items={inventory.items}
                    loading={inventory.loading}
                    onUseItem={inventory.useItem}
                    onDeleteItem={inventory.deleteItem}
                    onPauseItem={inventory.pauseItem}
                    onResumeItem={inventory.resumeItem}
                    onSyncTimer={inventory.syncTimer}
                />

                {/* Spending Log */}
                <Card className="bg-brand-gray border-sidebar-border overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                        <SpendingLog logs={logs} />
                    </CardContent>
                </Card>
            </div>

            {/* Purchase Confirmation Dialog */}
            <PurchaseConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmPurchase}
                item={selectedItem}
            />

            {/* Ghost Clone Animation Overlay */}
            {purchasedClone && purchasedCloneRect && (
                <div
                    className="fixed z-50 pointer-events-none animate-[flyToInventory_0.5s_ease-in_forwards]"
                    style={{
                        top: purchasedCloneRect.top,
                        left: purchasedCloneRect.left,
                        width: purchasedCloneRect.width,
                        height: purchasedCloneRect.height,
                    }}
                >
                    <div className="w-full h-full p-5 rounded-xl bg-brand-gray border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)] opacity-95">
                        <div className="flex items-start gap-3">
                            {purchasedClone.emoji === "BT_HEX" ? (
                                <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                                    <Hexagon
                                        className="w-7 h-7"
                                        style={{
                                            color: TOKEN_CONFIG.black.color,
                                            fill: TOKEN_CONFIG.black.fill,
                                            filter: `drop-shadow(0 0 5px ${TOKEN_CONFIG.black.glow})`
                                        }}
                                        strokeWidth={2.5}
                                    />
                                </div>
                            ) : (
                                <span className="text-2xl pt-1">{purchasedClone.emoji}</span>
                            )}
                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-sm font-mono font-bold text-white truncate">{purchasedClone.name}</h3>
                                <p className="text-[11px] font-mono text-green-400 mt-0.5">Purchased!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes flyToInventory {
                    0% { transform: translate(0px, 0px); opacity: 1; }
                    100% { transform: translate(0px, 600px); opacity: 0; }
                }
            `}} />
        </div>
    )
}
