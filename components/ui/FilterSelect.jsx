"use client";

import { Filter } from "lucide-react";

export function FilterSelect({ value, onChange, options = [], placeholder = "Filter by..." }) {
    return (
        <div className="relative w-full max-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-full appearance-none rounded-md border border-input/60 bg-background/50 pl-9 pr-8 text-sm shadow-sm transition-all hover:border-primary/30 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="all">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m1 1 4 4 4-4" />
                </svg>
            </div>
        </div>
    );
}
