"use client";

import { Input } from "@/components/ui/Input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SearchBar({ value, onChange, placeholder = "Search..." }) {
    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 pr-9 bg-background/50 border-input/60 focus:bg-background transition-all duration-300 shadow-sm hover:border-primary/30"
                placeholder={placeholder}
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
