'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
    { day: 'Mon', mining: 120, burn: 40 },
    { day: 'Tue', mining: 150, burn: 80 },
    { day: 'Wed', mining: 180, burn: 120 },
    { day: 'Thu', mining: 90, burn: 30 },
    { day: 'Fri', mining: 100, burn: 90 },
    { day: 'Sat', mining: 250, burn: 10 },
    { day: 'Sun', mining: 300, burn: 0 },
];

export function PerformanceChart() {
    return (
        <Card className="bg-brand-gray border-sidebar-border overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-gray-400 text-xs uppercase tracking-widest font-mono">
                    7-Day Performance
                </CardTitle>
                <span className="text-xs text-brand-green font-mono animate-pulse">● Live Data</span>
            </CardHeader>

            <CardContent className="h-[250px] w-full mt-4 px-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#848E9C"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            tick={{ fill: '#848E9C' }}
                        />
                        <YAxis
                            stroke="#848E9C"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#848E9C' }}
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
                            stroke="#F6465D" // Red (Mining/Activity based on context)
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#F6465D', stroke: '#1E2329', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="burn"
                            stroke="#8F00FF" // Purple/Dark for Burn Rate
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                            activeDot={{ r: 4, fill: '#8F00FF', stroke: '#1E2329', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-6 mt-4 text-[10px] font-mono uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-red shadow-[0_0_8px_rgba(246,70,93,0.5)]" />
                        <span className="text-gray-400">Mining Rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#8F00FF] shadow-[0_0_8px_rgba(143,0,255,0.5)]" />
                        <span className="text-gray-400">Burn Rate</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
