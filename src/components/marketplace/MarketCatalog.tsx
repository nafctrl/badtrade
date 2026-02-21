"use client"

import { MarketItem, MarketItemData } from "./MarketItem"

interface MarketCatalogProps {
    items: MarketItemData[]
    redTokens: number
    goldTokens: number
    blackTokens: number
    onBuy: (item: MarketItemData, rect?: DOMRect) => void
}

export function MarketCatalog({ items, redTokens, goldTokens, blackTokens, onBuy }: MarketCatalogProps) {
    const getBalance = (tokenType: string) => {
        switch (tokenType) {
            case "red": return redTokens
            case "gold": return goldTokens
            case "black": return blackTokens
            default: return 0
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
                return (
                    <MarketItem
                        key={item.id}
                        item={item}
                        balance={getBalance(item.tokenType)}
                        onBuy={onBuy}
                    />
                )
            })}
            {items.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-600 font-mono text-sm">
                    No items available
                </div>
            )}
        </div>
    )
}
