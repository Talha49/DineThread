"use client";

import { useState, useEffect } from "react";
import { Check, Pipette } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
    "#4f46e5", // Default Indigo
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#a855f7", // Purple
    "#ec4899", // Pink
    "#111827", // Black
];

export function ColorPicker({ value, onChange, label }) {
    // Local state for free input to allow typing without jitter
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleHexChange = (e) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        // Basic hex validation before propagating
        if (/^#([0-9A-F]{3}){1,2}$/i.test(newVal)) {
            onChange(newVal);
        }
    };

    return (
        <div className="space-y-3">
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}

            <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className={cn(
                            "w-8 h-8 rounded-full border border-border shadow-sm flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                            value === color && "ring-2 ring-offset-2 ring-primary"
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                    >
                        {value === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 items-center">
                <div
                    className="w-10 h-10 rounded-md border border-border shrink-0 shadow-sm"
                    style={{
                        backgroundColor: (() => {
                            // Fallback for invalid hex in preview
                            try { return /^#([0-9A-F]{3}){1,2}$/i.test(localValue) ? localValue : "#ffffff" } catch { return "#ffffff" }
                        })()
                    }}
                />
                <Input
                    value={localValue}
                    onChange={handleHexChange}
                    placeholder="#000000"
                    startIcon={<Pipette className="w-4 h-4" />}
                    className="flex-1"
                />
            </div>
        </div>
    );
}
