"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const Input = React.forwardRef(
    ({ className, type, label, error, startIcon, endIcon, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const inputType = type === "password" && showPassword ? "text" : type;

        return (
            <div className="relative w-full ">
                <div className="relative">
                    {startIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            {startIcon}
                        </div>
                    )}

                    <input
                        type={inputType}
                        className={cn(
                            "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 peer",
                            label ? "placeholder:text-transparent" : "placeholder:text-muted-foreground",
                            startIcon && "pl-10",
                            endIcon && "pr-10",
                            type === "password" && "pr-10",
                            error && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                        placeholder={label || "placeholder"} // Placeholder required for peer-placeholder-shown
                        ref={ref}
                        {...props}
                    />

                    {label && (
                        <label
                            className={cn(
                                "absolute left-3 top-2.5 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-muted-foreground bg-background px-1 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary",
                                startIcon && "left-10",
                                error && "text-destructive peer-focus:text-destructive"
                            )}
                        >
                            {label}
                        </label>
                    )}

                    {type === "password" ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    ) : endIcon ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            {endIcon}
                        </div>
                    ) : null}
                </div>

                {error && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive animate-fade-in">
                        <AlertCircle className="h-3 w-3" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
