"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("w-full", className)}
        data-value={value}
        {...props}
    >
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { value, onValueChange });
            }
            return child;
        })}
    </div>
));
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-12 items-center justify-center rounded-lg bg-muted/40 p-1 text-muted-foreground shadow-sm",
            className
        )}
        {...props}
    >
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { selectedValue: value, onSelect: onValueChange });
            }
            return child;
        })}
    </div>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, value, children, selectedValue, onSelect, ...props }, ref) => {
    const isSelected = selectedValue === value;
    return (
        <button
            ref={ref}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect && onSelect(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isSelected ? "bg-background text-foreground shadow-md" : "hover:bg-muted/60 hover:text-foreground",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, value, children, selectedValue, ...props }, ref) => {
    if (value !== (props.value || selectedValue)) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in-up",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TabsContent.displayName = "TabsContent";

// Helper to inject context (simplified version)
// For robust usage, context API is better, but this prop passing works for simple composition.
// Actually, let's allow it to work if standard composition is used.

// Rewriting using Context to properly handle deep nesting if needed? 
// No, keep it simple for now. The component structure above relies on direct children for Tabs -> TabsList/TabsContent.
// But TabsContent is usually sibling to TabsList inside Tabs.
// Let's use React Context.

const TabsContext = React.createContext({});

const TabsRoot = React.forwardRef(({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const [selected, setSelected] = React.useState(value || defaultValue);

    const handleChange = (val) => {
        if (value === undefined) {
            setSelected(val);
        }
        onValueChange?.(val);
    };

    const currentValue = value !== undefined ? value : selected;

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
            <div ref={ref} className={cn("w-full", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
});
TabsRoot.displayName = "Tabs";

const TabsListContext = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "inline-flex h-12 items-center justify-center rounded-lg bg-muted/40 p-1 text-muted-foreground shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TabsListContext.displayName = "TabsList";

const TabsTriggerContext = React.forwardRef(({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
    const isSelected = selectedValue === value;

    return (
        <button
            ref={ref}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isSelected ? "bg-background text-foreground shadow-sm font-semibold" : "hover:bg-muted/60 hover:text-foreground",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});
TabsTriggerContext.displayName = "TabsTrigger";

const TabsContentContext = React.forwardRef(({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = React.useContext(TabsContext);

    if (selectedValue !== value) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TabsContentContext.displayName = "TabsContent";

export { TabsRoot as Tabs, TabsListContext as TabsList, TabsTriggerContext as TabsTrigger, TabsContentContext as TabsContent };
