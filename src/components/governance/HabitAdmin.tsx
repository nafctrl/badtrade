"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitRow {
    id: string
    category: string
    label: string
    emoji: string
    unit: string
    red_reps_per_token: number
    red_min_gain: number
    gold_reps_per_token: number
    gold_min_gain: number
    sort_order: number
    is_active: boolean
}

const CATEGORIES = ["Body", "Faith", "Mind"]

const EMPTY_HABIT: Omit<HabitRow, 'id'> = {
    category: "Body",
    label: "",
    emoji: "💪",
    unit: "reps",
    red_reps_per_token: 10,
    red_min_gain: 0.5,
    gold_reps_per_token: 20,
    gold_min_gain: 1,
    sort_order: 0,
    is_active: true,
}

export function HabitAdmin() {
    const [habits, setHabits] = React.useState<HabitRow[]>([])
    const [loading, setLoading] = React.useState(true)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editForm, setEditForm] = React.useState<Omit<HabitRow, 'id'> | null>(null)
    const [isAdding, setIsAdding] = React.useState(false)
    const [addForm, setAddForm] = React.useState(EMPTY_HABIT)

    const loadHabits = React.useCallback(async () => {
        const { data } = await supabase
            .from('habits')
            .select('*')
            .order('sort_order')
        if (data) setHabits(data.map(d => ({
            ...d,
            red_min_gain: Number(d.red_min_gain),
            gold_min_gain: Number(d.gold_min_gain),
        })))
        setLoading(false)
    }, [])

    React.useEffect(() => { loadHabits() }, [loadHabits])

    const handleSaveEdit = async (id: string) => {
        if (!editForm) return
        await supabase.from('habits').update(editForm).eq('id', id)
        setEditingId(null)
        setEditForm(null)
        loadHabits()
    }

    const handleAdd = async () => {
        const id = addForm.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (!id) return
        await supabase.from('habits').insert({ id, ...addForm })
        setIsAdding(false)
        setAddForm(EMPTY_HABIT)
        loadHabits()
    }

    const handleDelete = async (id: string) => {
        await supabase.from('habits').delete().eq('id', id)
        loadHabits()
    }

    const handleToggleActive = async (habit: HabitRow) => {
        await supabase.from('habits').update({ is_active: !habit.is_active }).eq('id', habit.id)
        loadHabits()
    }

    const categoryColor = (cat: string) => {
        switch (cat) {
            case 'Body': return 'text-brand-red bg-red-950/20 border-red-900/30'
            case 'Faith': return 'text-green-400 bg-green-950/20 border-green-900/30'
            case 'Mind': return 'text-blue-400 bg-blue-950/20 border-blue-900/30'
            default: return 'text-gray-400 bg-gray-950/20 border-gray-800/30'
        }
    }

    // Shared form fields component
    const FormFields = ({ form, setForm }: { form: Omit<HabitRow, 'id'>; setForm: (f: Omit<HabitRow, 'id'>) => void }) => (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <input
                    className="px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                    placeholder="Label (e.g. Push-up)"
                    value={form.label}
                    onChange={e => setForm({ ...form, label: e.target.value })}
                />
                <input
                    className="px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                    placeholder="Emoji"
                    value={form.emoji}
                    onChange={e => setForm({ ...form, emoji: e.target.value })}
                />
                <select
                    className="px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-5 gap-3">
                <div>
                    <label className="text-[10px] font-mono text-gray-600 uppercase mb-1 block">Unit</label>
                    <input
                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                        placeholder="reps"
                        value={form.unit}
                        onChange={e => setForm({ ...form, unit: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-mono text-red-500/60 uppercase mb-1 block">RT Rate</label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                        value={form.red_reps_per_token}
                        onChange={e => setForm({ ...form, red_reps_per_token: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-mono text-red-500/60 uppercase mb-1 block">RT Min</label>
                    <input
                        type="number"
                        step="0.5"
                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                        value={form.red_min_gain}
                        onChange={e => setForm({ ...form, red_min_gain: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-mono text-yellow-500/60 uppercase mb-1 block">GT Rate</label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                        value={form.gold_reps_per_token}
                        onChange={e => setForm({ ...form, gold_reps_per_token: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-mono text-yellow-500/60 uppercase mb-1 block">GT Min</label>
                    <input
                        type="number"
                        step="0.5"
                        className="w-full px-3 py-2 rounded-lg bg-brand-black/60 border border-sidebar-border text-white font-mono text-sm focus:outline-none focus:border-gray-500"
                        value={form.gold_min_gain}
                        onChange={e => setForm({ ...form, gold_min_gain: Number(e.target.value) })}
                    />
                </div>
            </div>
        </div>
    )

    if (loading) {
        return <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 rounded-lg bg-brand-black/40 animate-pulse" />)}</div>
    }

    return (
        <div className="space-y-4">
            {/* Group by category */}
            {CATEGORIES.map(category => {
                const categoryHabits = habits.filter(h => h.category === category)
                if (categoryHabits.length === 0) return null
                return (
                    <div key={category}>
                        <div className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider mb-2 border", categoryColor(category))}>
                            {category}
                        </div>
                        <div className="space-y-2">
                            {categoryHabits.map(habit => (
                                <div key={habit.id} className={cn(
                                    "rounded-lg border bg-brand-black/30 p-4 transition-all",
                                    habit.is_active ? "border-sidebar-border" : "border-sidebar-border/30 opacity-50"
                                )}>
                                    {editingId === habit.id && editForm ? (
                                        <div className="space-y-3">
                                            <FormFields form={editForm} setForm={setEditForm} />
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" className="border-sidebar-border text-gray-400 font-mono text-xs" onClick={() => { setEditingId(null); setEditForm(null) }}>
                                                    <X className="w-3 h-3 mr-1" /> Cancel
                                                </Button>
                                                <Button size="sm" className="bg-green-800/40 text-green-400 hover:bg-green-700/50 font-mono text-xs border border-green-800/30" onClick={() => handleSaveEdit(habit.id)}>
                                                    <Save className="w-3 h-3 mr-1" /> Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{habit.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-mono font-bold text-white">{habit.label}</span>
                                                    <span className="text-[10px] font-mono text-gray-600">{habit.unit}</span>
                                                </div>
                                                <div className="flex gap-3 mt-0.5">
                                                    <span className="text-[10px] font-mono text-red-400/60">{habit.red_reps_per_token} {habit.unit}/RT</span>
                                                    <span className="text-[10px] font-mono text-yellow-400/60">{habit.gold_reps_per_token} {habit.unit}/GT</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    className="p-1.5 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
                                                    onClick={() => handleToggleActive(habit)}
                                                >
                                                    {habit.is_active ? <Eye className="w-3.5 h-3.5 text-green-500" /> : <EyeOff className="w-3.5 h-3.5 text-gray-600" />}
                                                </button>
                                                <button
                                                    className="p-1.5 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
                                                    onClick={() => { setEditingId(habit.id); setEditForm({ category: habit.category, label: habit.label, emoji: habit.emoji, unit: habit.unit, red_reps_per_token: habit.red_reps_per_token, red_min_gain: habit.red_min_gain, gold_reps_per_token: habit.gold_reps_per_token, gold_min_gain: habit.gold_min_gain, sort_order: habit.sort_order, is_active: habit.is_active }) }}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    onClick={() => handleDelete(habit.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* Add new habit */}
            {isAdding ? (
                <div className="rounded-lg border border-dashed border-green-800/30 bg-green-950/10 p-4 space-y-3">
                    <FormFields form={addForm} setForm={setAddForm} />
                    <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" className="border-sidebar-border text-gray-400 font-mono text-xs" onClick={() => { setIsAdding(false); setAddForm(EMPTY_HABIT) }}>
                            <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" className="bg-green-800/40 text-green-400 hover:bg-green-700/50 font-mono text-xs border border-green-800/30" onClick={handleAdd} disabled={!addForm.label}>
                            <Save className="w-3 h-3 mr-1" /> Add Habit
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    className="w-full py-3 rounded-lg border border-dashed border-sidebar-border text-gray-600 hover:text-gray-400 hover:border-gray-500 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Habit
                </button>
            )}
        </div>
    )
}
