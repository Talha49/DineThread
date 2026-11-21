"use client";

import { useState } from 'react';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DynamicPricingForm({ config, onChange }) {
    const rules = config?.intelligence?.dynamicPricing?.rules || [];

    const handleAddRule = () => {
        const newRule = {
            id: Date.now().toString(),
            name: 'Happy Hour',
            type: 'percentage',
            value: 20,
            days: [1, 2, 3, 4, 5], // Weekdays
            startTime: '16:00',
            endTime: '19:00',
            enabled: true
        };
        
        onChange({
            ...config,
            intelligence: {
                ...config?.intelligence,
                dynamicPricing: {
                    ...config?.intelligence?.dynamicPricing,
                    rules: [...rules, newRule]
                }
            }
        });
    };

    const handleDeleteRule = (id) => {
        onChange({
            ...config,
            intelligence: {
                ...config?.intelligence,
                dynamicPricing: {
                    ...config?.intelligence?.dynamicPricing,
                    rules: rules.filter(r => r.id !== id)
                }
            }
        });
    };

    const handleUpdateRule = (id, updates) => {
        onChange({
            ...config,
            intelligence: {
                ...config?.intelligence,
                dynamicPricing: {
                    ...config?.intelligence?.dynamicPricing,
                    rules: rules.map(r => r.id === id ? { ...r, ...updates } : r)
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Active Rules</h4>
                </div>
                <button 
                    onClick={handleAddRule}
                    className="flex items-center gap-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <Plus className="w-3 h-3" />
                    Add Rule
                </button>
            </div>

            <div className="space-y-4">
                {rules.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-zinc-200 rounded-[2rem] text-center">
                        <Tag className="w-8 h-8 text-zinc-300 mx-auto mb-4" />
                        <p className="text-sm text-zinc-500 font-medium">No active pricing rules. Add your first Happy Hour!</p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div 
                            key={rule.id}
                            className={cn(
                                "p-6 rounded-[2rem] border-2 transition-all",
                                rule.enabled ? "border-zinc-900 bg-white shadow-xl" : "border-zinc-100 bg-zinc-50 opacity-60"
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="text"
                                            value={rule.name}
                                            onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                                            className="font-black italic uppercase tracking-tight text-lg bg-transparent border-none p-0 focus:ring-0 w-full"
                                        />
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                            rule.enabled ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-500"
                                        )}>
                                            {rule.enabled ? 'Live' : 'Paused'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                <Tag className="w-3 h-3" /> Discount
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number"
                                                    value={rule.value}
                                                    onChange={(e) => handleUpdateRule(rule.id, { value: parseInt(e.target.value) })}
                                                    className="w-16 bg-zinc-50 border-none rounded-lg text-sm font-bold p-2 focus:ring-1 focus:ring-primary"
                                                />
                                                <select 
                                                    value={rule.type}
                                                    onChange={(e) => handleUpdateRule(rule.id, { type: e.target.value })}
                                                    className="bg-zinc-50 border-none rounded-lg text-[10px] font-black uppercase p-2 focus:ring-1 focus:ring-primary"
                                                >
                                                    <option value="percentage">% OFF</option>
                                                    <option value="fixed">$ OFF</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Time Window
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="time"
                                                    value={rule.startTime}
                                                    onChange={(e) => handleUpdateRule(rule.id, { startTime: e.target.value })}
                                                    className="bg-zinc-50 border-none rounded-lg text-[10px] font-bold p-2 focus:ring-1 focus:ring-primary"
                                                />
                                                <span className="text-zinc-300">→</span>
                                                <input 
                                                    type="time"
                                                    value={rule.endTime}
                                                    onChange={(e) => handleUpdateRule(rule.id, { endTime: e.target.value })}
                                                    className="bg-zinc-50 border-none rounded-lg text-[10px] font-bold p-2 focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                            <CalendarIcon className="w-3 h-3" /> Active Days
                                        </label>
                                        <div className="flex flex-wrap gap-1">
                                            {['S','M','T','W','T','F','S'].map((day, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        const newDays = rule.days.includes(i)
                                                            ? rule.days.filter(d => d !== i)
                                                            : [...rule.days, i];
                                                        handleUpdateRule(rule.id, { days: newDays });
                                                    }}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                                                        rule.days.includes(i) 
                                                            ? "bg-zinc-900 text-white" 
                                                            : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                                                    )}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => handleUpdateRule(rule.id, { enabled: !rule.enabled })}
                                        className={cn(
                                            "p-3 rounded-2xl transition-all",
                                            rule.enabled ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"
                                        )}
                                    >
                                        <Clock className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
