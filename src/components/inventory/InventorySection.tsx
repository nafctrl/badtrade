"use client"

import * as React from "react"
import { PackageOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryItemCard } from "./InventoryItemCard"
import type { InventoryItem } from "@/lib/supabase"

interface InventorySectionProps {
    items: InventoryItem[]
    loading: boolean
    onUseItem: (id: string) => Promise<boolean>
    onDeleteItem: (id: string) => Promise<boolean>
    onPauseItem: (id: string, remainingMs: number) => Promise<boolean>
    onResumeItem: (id: string) => Promise<boolean>
    onSyncTimer: (id: string, newExpiresAt: string) => Promise<boolean>
}

export function InventorySection({ items, loading, onUseItem, onDeleteItem, onPauseItem, onResumeItem, onSyncTimer }: InventorySectionProps) {

    return (
        <Card className="bg-brand-gray border-sidebar-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-950/5 via-transparent to-transparent pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-gray-400">
                    <PackageOpen className="w-4 h-4 text-green-500/50" />
                    Inventory
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 rounded-xl bg-brand-black/40 animate-pulse" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center">
                        <PackageOpen className="w-12 h-12 text-gray-700 mb-3 block" strokeWidth={1} />
                        <h4 className="font-mono text-sm text-gray-500 uppercase tracking-widest">
                            Locker is Empty
                        </h4>
                        <p className="font-mono text-[11px] text-gray-600 mt-2 max-w-sm">
                            Buy items from the Black Market above. They will be stored here until you are ready to activate them.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <InventoryItemCard
                                key={item.id}
                                item={item}
                                onUseItem={onUseItem}
                                onDeleteItem={onDeleteItem}
                                onPauseItem={onPauseItem}
                                onResumeItem={onResumeItem}
                                onSyncTimer={onSyncTimer}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
