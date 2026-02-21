"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Save, X, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketplaceItem {
    id: string
    name: string
    description: string
    emoji: string
    cost: number
    token_type: string
    stock: number | null
    duration_minutes: number | null
    is_active: boolean
    sort_order: number
}

const EMPTY_ITEM: Omit<MarketplaceItem, 'id'> = {
    name: "",
    description: "",
    emoji: "📦",
    cost: 1,
    token_type: "red",
    stock: null,
    duration_minutes: null,
    is_active: true,
    sort_order: 0,
}

export function MarketplaceAdmin() {
    const [items, setItems] = React.useState<MarketplaceItem[]>([])
    const [loading, setLoading] = React.useState(true)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editForm, setEditForm] = React.useState<Omit<MarketplaceItem, 'id'> | null>(null)
    const [isAdding, setIsAdding] = React.useState(false)
    const [addForm, setAddForm] = React.useState(EMPTY_ITEM)

    const loadItems = React.useCallback(async () => {
        const { data } = await supabase
            .from('marketplace_items')
            .select('*')
            .order('sort_order')
        if (data) setItems(data.map(d => ({ ...d, cost: Number(d.cost) })))
        setLoading(false)
    }, [])

    React.useEffect(() => { loadItems() }, [loadItems])

    const handleSaveEdit = async (id: string) => {
        if (!editForm) return
        await supabase.from('marketplace_items').update(editForm).eq('id', id)
        setEditingId(null)
        setEditForm(null)
        loadItems()
    }

    const handleAdd = async () => {
        const id = addForm.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36)
        await supabase.from('marketplace_items').insert({ id, ...addForm })
        setIsAdding(false)
        setAddForm(EMPTY_ITEM)
        loadItems()
    }

    const handleDelete = async (id: string) => {
        await supabase.from('marketplace_items').delete().eq('id', id)
        loadItems()
    }

    const handleToggleActive = async (item: MarketplaceItem) => {
        await supabase.from('marketplace_items').update({ is_active: !item.is_active }).eq('id', item.id)
        loadItems()
    }

    const tokenColor = (type: string) => {
        switch (type) {
            case 'red': return 'text-brand-red'
            case 'gold': return 'text-brand-gold'
            default: return 'text-gray-400'
        }
    }

    if (loading) {
        return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-brand-black/40 animate-pulse" />)}</div>
    }

    return (
        <div className="space-y-4">
            {/* Item List */}
            {items.map(item => (
                <div key={item.id} className={cn(
                    "rounded-lg border bg-brand-black/30 p-4 transition-all",
                    item.is_active ? "border-sidebar-border" : "border-sidebar-border/30 opacity-50"
                )}>
                    {editingId === item.id && editForm ? (
                        // Edit mode
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    className="px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                    placeholder="Name"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                                <input
                                    className="px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                    placeholder="Emoji"
                                    value={editForm.emoji}
                                    onChange={e => setEditForm({ ...editForm, emoji: e.target.value })}
                                />
                            </div>
                            <textarea
                                className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-gray-300 font-mono text-xs focus:outline-none focus:border-gray-500 resize-none"
                                placeholder="Description"
                                rows={2}
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            />
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Cost</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                        value={editForm.cost}
                                        onChange={e => setEditForm({ ...editForm, cost: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Token</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                        value={editForm.token_type}
                                        onChange={e => setEditForm({ ...editForm, token_type: e.target.value })}
                                    >
                                        <option value="red">RT (Red)</option>
                                        <option value="gold">GT (Gold)</option>
                                        <option value="black">BT (Black)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Stock</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                        placeholder="∞"
                                        value={editForm.stock ?? ''}
                                        onChange={e => setEditForm({ ...editForm, stock: e.target.value ? Number(e.target.value) : null })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Duration</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                        placeholder="∞ (min)"
                                        value={editForm.duration_minutes ?? ''}
                                        onChange={e => setEditForm({ ...editForm, duration_minutes: e.target.value ? Number(e.target.value) : null })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" className="border-sidebar-border text-gray-400 font-mono text-xs" onClick={() => { setEditingId(null); setEditForm(null) }}>
                                    <X className="w-3 h-3 mr-1" /> Cancel
                                </Button>
                                <Button size="sm" className="bg-green-800/40 text-green-400 hover:bg-green-700/50 font-mono text-xs border border-green-800/30" onClick={() => handleSaveEdit(item.id)}>
                                    <Save className="w-3 h-3 mr-1" /> Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // View mode
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{item.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono font-bold text-white truncate">{item.name}</span>
                                    <span className={cn("text-xs font-mono font-bold", tokenColor(item.token_type))}>
                                        {item.cost} {item.token_type === 'red' ? 'RT' : item.token_type === 'gold' ? 'GT' : 'BT'}
                                    </span>
                                    {item.stock !== null && (
                                        <span className="text-[10px] font-mono text-gray-600">Stock: {item.stock}</span>
                                    )}
                                    {item.duration_minutes !== null && (
                                        <span className="text-[10px] font-mono text-brand-red/60">⏱ {item.duration_minutes}min</span>
                                    )}
                                </div>
                                <p className="text-[11px] font-mono text-gray-500 truncate">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    className="p-1.5 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
                                    onClick={() => handleToggleActive(item)}
                                    title={item.is_active ? "Deactivate" : "Activate"}
                                >
                                    <Package className={cn("w-3.5 h-3.5", item.is_active ? "text-green-500" : "text-gray-600")} />
                                </button>
                                <button
                                    className="p-1.5 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
                                    onClick={() => { setEditingId(item.id); setEditForm({ name: item.name, description: item.description, emoji: item.emoji, cost: item.cost, token_type: item.token_type, stock: item.stock, duration_minutes: item.duration_minutes, is_active: item.is_active, sort_order: item.sort_order }) }}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Add new item form */}
            {isAdding ? (
                <div className="rounded-lg border border-dashed border-green-800/30 bg-green-950/10 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            className="px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                            placeholder="Item name"
                            value={addForm.name}
                            onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                        />
                        <input
                            className="px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                            placeholder="Emoji"
                            value={addForm.emoji}
                            onChange={e => setAddForm({ ...addForm, emoji: e.target.value })}
                        />
                    </div>
                    <textarea
                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-gray-300 font-mono text-xs focus:outline-none focus:border-gray-500 resize-none"
                        placeholder="Description"
                        rows={2}
                        value={addForm.description}
                        onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                    />
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Cost</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                value={addForm.cost}
                                onChange={e => setAddForm({ ...addForm, cost: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Token</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                value={addForm.token_type}
                                onChange={e => setAddForm({ ...addForm, token_type: e.target.value })}
                            >
                                <option value="red">RT (Red)</option>
                                <option value="gold">GT (Gold)</option>
                                <option value="black">BT (Black)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Stock</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                placeholder="∞ (unlimited)"
                                value={addForm.stock ?? ''}
                                onChange={e => setAddForm({ ...addForm, stock: e.target.value ? Number(e.target.value) : null })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Duration</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                                placeholder="∞ (min)"
                                value={addForm.duration_minutes ?? ''}
                                onChange={e => setAddForm({ ...addForm, duration_minutes: e.target.value ? Number(e.target.value) : null })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" className="border-sidebar-border text-gray-400 font-mono text-xs" onClick={() => { setIsAdding(false); setAddForm(EMPTY_ITEM) }}>
                            <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" className="bg-green-800/40 text-green-400 hover:bg-green-700/50 font-mono text-xs border border-green-800/30" onClick={handleAdd} disabled={!addForm.name}>
                            <Save className="w-3 h-3 mr-1" /> Add Item
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    className="w-full py-3 rounded-lg border border-dashed border-sidebar-border text-gray-600 hover:text-gray-400 hover:border-gray-500 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                </button>
            )}
        </div>
    )
}
