"use client"

import * as React from "react"
import { supabase, DUMMY_USER_ID } from "@/lib/supabase"
import { InventoryItem } from "@/lib/supabase"
import type { MarketItemData } from "../marketplace/MarketItem"

export function useInventory() {
    const [items, setItems] = React.useState<InventoryItem[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchInventory = React.useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', DUMMY_USER_ID)
            .order('purchased_at', { ascending: false })

        if (!error && data) {
            setItems(data as InventoryItem[])
        } else {
            console.error("Failed to fetch inventory:", error)
        }
        setLoading(false)
    }, [])

    React.useEffect(() => {
        fetchInventory()
    }, [fetchInventory])

    const addItem = async (catalogItem: MarketItemData) => {
        const newItem = {
            user_id: DUMMY_USER_ID,
            item_id: catalogItem.id,
            item_name: catalogItem.name,
            item_type: catalogItem.tokenType,
            item_emoji: catalogItem.emoji,
            duration_minutes: catalogItem.duration_minutes,
            status: 'Inactive',
        }

        const { data, error } = await supabase
            .from('inventory_items')
            .insert(newItem)
            .select()
            .single()

        if (!error && data) {
            setItems(prev => [data as InventoryItem, ...prev])
            return true
        } else {
            console.error("Failed to add to inventory:", error)
            return false
        }
    }

    const useItem = async (inventoryId: string) => {
        const targetItem = items.find(i => i.id === inventoryId)
        if (!targetItem) return false

        // Skip items without duration for now
        if (!targetItem.duration_minutes) {
            console.log("No duration, skipping item usage logic.")
            return false
        }

        const now = new Date()
        const expiresAt = new Date(now.getTime() + (targetItem.duration_minutes * 60000))

        const updates = {
            status: 'Active',
            activated_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
        }

        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === inventoryId ? { ...item, ...updates } as InventoryItem : item
        ))

        const { error } = await supabase
            .from('inventory_items')
            .update(updates)
            .eq('id', inventoryId)
            .eq('user_id', DUMMY_USER_ID)

        if (error) {
            console.error("Failed to use item:", error)
            // Revert optimistic update
            fetchInventory()
            return false
        }

        return true
    }

    const deleteItem = async (inventoryId: string) => {
        const { error } = await supabase
            .from('inventory_items')
            .delete()
            .eq('id', inventoryId)
            .eq('user_id', DUMMY_USER_ID)

        if (error) {
            console.error("Failed to delete item:", error)
            return false
        }

        setItems(prev => prev.filter(item => item.id !== inventoryId))
        return true
    }

    const pauseItem = async (inventoryId: string, remainingMs: number) => {
        const targetItem = items.find(i => i.id === inventoryId)
        if (!targetItem || targetItem.status !== 'Active') return false

        const updates = {
            status: 'Paused',
            paused_remaining_ms: remainingMs,
            expires_at: null
        }

        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === inventoryId ? { ...item, ...updates } as InventoryItem : item
        ))

        const { error } = await supabase
            .from('inventory_items')
            .update(updates)
            .eq('id', inventoryId)
            .eq('user_id', DUMMY_USER_ID)

        if (error) {
            console.error("Failed to pause item:", error)
            fetchInventory()
            return false
        }
        return true
    }

    const resumeItem = async (inventoryId: string) => {
        const targetItem = items.find(i => i.id === inventoryId)
        if (!targetItem || targetItem.status !== 'Paused' || targetItem.paused_remaining_ms == null) return false

        const newExpiresAt = new Date(Date.now() + targetItem.paused_remaining_ms).toISOString()

        const updates = {
            status: 'Active',
            paused_remaining_ms: null,
            expires_at: newExpiresAt
        }

        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === inventoryId ? { ...item, ...updates } as InventoryItem : item
        ))

        const { error } = await supabase
            .from('inventory_items')
            .update(updates)
            .eq('id', inventoryId)
            .eq('user_id', DUMMY_USER_ID)

        if (error) {
            console.error("Failed to resume item:", error)
            fetchInventory()
            return false
        }
        return true
    }

    const syncTimer = async (inventoryId: string, newExpiresAt: string) => {
        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === inventoryId ? { ...item, expires_at: newExpiresAt } : item
        ))

        const { error } = await supabase
            .from('inventory_items')
            .update({ expires_at: newExpiresAt })
            .eq('id', inventoryId)
            .eq('user_id', DUMMY_USER_ID)

        if (error) {
            console.error("Failed to sync timer:", error)
            fetchInventory()
            return false
        }
        return true
    }

    return {
        items,
        loading,
        addItem,
        useItem,
        deleteItem,
        pauseItem,
        resumeItem,
        syncTimer,
        refresh: fetchInventory
    }
}
