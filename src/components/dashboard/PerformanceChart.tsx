'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type RangeOption = { label: string; days: number; title: string };

const RANGES: RangeOption[] = [
    { label: 'Today', days: 1, title: "Today's Performance" },
    { label: '7D', days: 7, title: '7-Day Performance' },
    { label: '30D', days: 30, title: '30-Day Performance' },
];

export function PerformanceChart() {
    const [selectedRange, setSelectedRange] = useState<RangeOption>(RANGES[1]); // default 7D
    const { data, loading } = usePerformanceData(selectedRange.days);

    return (
        <Card className="bg-brand-gray border-sidebar-border overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-gray-400 text-xs uppercase tracking-widest font-mono">
                    {selectedRange.title}
                </CardTitle>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-brand-black/50 rounded-md p-0.5 border border-sidebar-border">
                        {RANGES.map((range) => (
                            <button
                                key={range.label}
                                onClick={() => setSelectedRange(range)}
                                className={cn(
                                    "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all duration-200",
                                    selectedRange.label === range.label
                                        ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/30 shadow-[0_0_8px_rgba(250,204,21,0.15)]"
                                        : "text-gray-500 hover:text-gray-300 border border-transparent"
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-brand-green font-mono animate-pulse">● Live</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 w-full mt-4 px-0 relative min-h-[180px]">
                {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-gray/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-4" />
                        <p className="text-xs font-mono text-gray-400 uppercase tracking-widest animate-pulse">Scanning ledgers...</p>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: -5, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
                        <Legend
                            verticalAlign="bottom"
                            height={24}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: '#848E9C',
                                paddingTop: '8px',
                            }}
                        />
                        <XAxis
                            dataKey="day"
                            stroke="#848E9C"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            tick={{ fill: '#848E9C' }}
                            interval={selectedRange.days > 7 ? Math.floor(selectedRange.days / 8) : 0}
                        />
                        <YAxis
                            stroke="#848E9C"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#848E9C' }}
                            width={45}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E2329',
                                borderColor: '#2B3139',
                                borderRadius: '4px',
                                color: '#EAECEF',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ paddingTop: '2px', paddingBottom: '2px' }}
                            cursor={{ stroke: '#2B3139', strokeWidth: 1 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="mining"
                            name="Mined"
                            stroke="#F6465D"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#F6465D', stroke: '#1E2329', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="burn"
                            name="Burned"
                            stroke="#8F00FF"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                            activeDot={{ r: 4, fill: '#8F00FF', stroke: '#1E2329', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
