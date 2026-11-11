"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { Pencil, Trash2, ImageOff, GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useMenuStore } from "@/hooks/use-menu-store";

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability, provided, snapshot }) {
    const { focusedItemId, toggleFeatured } = useMenuStore();
    const isFocused = focusedItemId === item._id;

    // Local state for optimistic UI updates on availability
    const [isAvailable, setIsAvailable] = useState(item.isAvailable);
    const [isToggling, setIsToggling] = useState(false);

    // Sync local state when parent item updates (e.g. after re-fetch)
    useEffect(() => {
        setIsAvailable(item.isAvailable);
    }, [item.isAvailable]);

    // Scroll into view if focused
    useEffect(() => {
        if (isFocused) {
            const el = document.getElementById(`item-${item._id}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isFocused, item._id]);

    const handleToggle = async (checked) => {
        setIsAvailable(checked); // Optimistic update
        setIsToggling(true);

        try {
            await onToggleAvailability(item._id, checked);
            toast.success(checked ? "Item available" : "Item unavailable");
        } catch (error) {
            setIsAvailable(!checked); // Revert on error
            toast.error("Failed to update status");
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <Card
            id={`item-${item._id}`}
            ref={provided?.innerRef}
            {...provided?.draggableProps}
            className={cn(
                "overflow-hidden group transition-all duration-300 border-border/50 bg-card/50",
                snapshot?.isDragging ? "shadow-2xl ring-2 ring-primary/50 scale-[1.02] z-50" : "hover:shadow-lg",
                isFocused && "ring-2 ring-primary bg-primary/5 shadow-xl scale-[1.01]"
            )}
        >
            {/* Image Area */}
            <div className="relative h-48 w-full bg-secondary/30 overflow-hidden">
                {/* Drag Handle Overlay */}
                <div
                    {...provided?.dragHandleProps}
                    className="absolute left-2 top-2 z-20 p-1.5 rounded-lg bg-background/80 backdrop-blur-md border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-background"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105",
                            !isAvailable && "grayscale opacity-60"
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="h-10 w-10 opacity-20" />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm">
                        {item.category}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {item.name}
                    </h3>
                    <span className="font-mono font-medium text-primary">
                        ${Number(item.price).toFixed(2)}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                    {item.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={isAvailable}
                            onCheckedChange={handleToggle}
                            disabled={isToggling}
                            aria-label="Toggle availability"
                        />
                        <span className={cn("text-xs font-medium", isAvailable ? "text-green-500" : "text-muted-foreground")}>
                            {isAvailable ? "Available" : "Unavailable"}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-full transition-all",
                            item.isFeatured ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20" : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                        )}
                        onClick={() => toggleFeatured(item._id, !item.isFeatured)}
                        title={item.isFeatured ? "Remove from Top Picks" : "Add to Top Picks"}
                    >
                        <Star className={cn("h-4 w-4", item.isFeatured && "fill-current")} />
                    </Button>
                </div>
            </CardContent>

            <CardFooter className="p-2 bg-secondary/20 flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 gap-1 h-8" onClick={() => onEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(item._id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
            </CardFooter>
        </Card>
    );
}
