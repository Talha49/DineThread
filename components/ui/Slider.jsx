"use client";

import { cn } from "@/lib/utils";

export function Slider({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    suffix = "",
    className
}) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-700 tracking-tight">{label}</label>
                <span className="text-[10px] font-black tabular-nums bg-zinc-100 px-2 py-0.5 rounded-md text-zinc-500 uppercase tracking-widest border border-zinc-200/50">
                    {value}{suffix}
                </span>
            </div>
            <div className="relative group h-6 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-primary group-hover:bg-zinc-200 transition-colors"
                    style={{
                        background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, #f4f4f5 ${percentage}%, #f4f4f5 100%)`,
                    }}
                />
                <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: white;
            border: 2px solid var(--primary);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          input[type="range"]:active::-webkit-slider-thumb {
            transform: scale(1.2);
            box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.1);
          }
        `}</style>
            </div>
        </div>
    );
}
