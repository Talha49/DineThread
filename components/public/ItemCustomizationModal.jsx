"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Plus, Minus, DollarSign, Check, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/store/useTranslation";
import { displayedSelection } from "@/lib/catalogue-policy";

export function ItemCustomizationModal({ item, isOpen, onClose, orderingEnabled = false, onAddToCart }) {
    const { t } = useTranslation();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedModifiers, setSelectedModifiers] = useState([]);
    const [qty, setQty] = useState(1);

    // Initialize selections when item changes
    useEffect(() => {
        if (item) {
            // Set default variant
            if (item.variants && item.variants.length > 0) {
                const defaultVariant = item.variants.find(v => v.isDefault) || item.variants[0];
                setSelectedVariant(defaultVariant);
            } else {
                setSelectedVariant(null);
            }
            setSelectedModifiers([]);
            setQty(1);
        }
    }, [item]);

    if (!item) return null;

    const hasVariants = item.variants && item.variants.length > 0;
    const hasModifiers = item.modifiers && item.modifiers.length > 0;

    // Calculate total price
    const calculateTotal = () => {
        let total = 0;

        if (hasVariants && selectedVariant) {
            total = selectedVariant.price;
        } else {
            total = item.price;
        }

        selectedModifiers.forEach(modId => {
            const modifier = item.modifiers.find(m => m._id === modId);
            if (modifier) {
                total += modifier.price;
            }
        });

        return total;
    };

    const toggleModifier = (modifierId) => {
        setSelectedModifiers(prev => {
            if (prev.includes(modifierId)) {
                return prev.filter(id => id !== modifierId);
            } else {
                return [...prev, modifierId];
            }
        });
    };

    // Group modifiers by category
    const groupedModifiers = hasModifiers ? item.modifiers.reduce((acc, mod) => {
        const category = mod.category || "Add-ons";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(mod);
        return acc;
    }, {}) : {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={item.name}
            className="max-w-2xl"
        >
            <div className="space-y-6">
                {/* Item Image & Description */}
                <div className="flex gap-6">
                    {item.imageUrl && (
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-zinc-100 shrink-0">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description || "A delicious menu item crafted with care."}
                        </p>
                        {!hasVariants && !hasModifiers && (
                            <div className="mt-4 text-2xl font-bold">
                                ${item.price.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Size Selection */}
                {hasVariants && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700">
                            {t('live_menu.choose_size')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {item.variants.map((variant) => (
                                <button
                                    key={variant._id || variant.name}
                                    type="button"
                                    onClick={() => setSelectedVariant(variant)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                        selectedVariant?.name === variant.name
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                            selectedVariant?.name === variant.name
                                                ? "border-primary bg-primary"
                                                : "border-zinc-300"
                                        )}>
                                            {selectedVariant?.name === variant.name && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <span className="font-bold text-sm">{variant.name}</span>
                                    </div>
                                    <span className="font-bold text-sm">
                                        ${variant.price.toFixed(2)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modifiers Selection */}
                {hasModifiers && (
                    <div className="space-y-4">
                        {Object.entries(groupedModifiers).map(([category, mods]) => (
                            <div key={category} className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {mods.map((modifier) => {
                                        const isSelected = selectedModifiers.includes(modifier._id);
                                        return (
                                            <button
                                                key={modifier._id || modifier.name}
                                                type="button"
                                                onClick={() => toggleModifier(modifier._id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                                    isSelected
                                                        ? "border-primary bg-primary/5 shadow-sm"
                                                        : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "border-primary bg-primary"
                                                            : "border-zinc-300"
                                                    )}>
                                                        {isSelected && (
                                                            <Check className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-sm">{modifier.name}</span>
                                                </div>
                                                <span className="font-bold text-sm text-muted-foreground">
                                                    +${modifier.price.toFixed(2)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Total Price Display */}
                {(hasVariants || hasModifiers) && (
                    <div className="pt-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold uppercase tracking-wider text-zinc-700">
                                {t('live_menu.total_price')}
                            </span>
                            <div className="text-3xl font-black tracking-tighter">
                                ${calculateTotal().toFixed(2)}
                            </div>
                        </div>
                        {selectedModifiers.length > 0 && (
                            <div className="text-xs text-muted-foreground space-y-1">
                                {hasVariants && selectedVariant && (
                                    <div className="flex justify-between">
                                        <span>{selectedVariant.name}</span>
                                        <span>${selectedVariant.price.toFixed(2)}</span>
                                    </div>
                                )}
                                {selectedModifiers.map(modId => {
                                    const mod = item.modifiers.find(m => m._id === modId);
                                    return mod ? (
                                        <div key={modId} className="flex justify-between">
                                            <span>+ {mod.name}</span>
                                            <span>${mod.price.toFixed(2)}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Add to Cart / Close */}
                <div className="pt-4">
                    {orderingEnabled ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 bg-zinc-50 rounded-2xl px-2 h-14 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-6 text-center font-bold">{qty}</span>
                                <button
                                    type="button"
                                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <Button
                                onClick={() => {
                                    onAddToCart?.({
                                        menuItemId: item._id,
                                        name: item.name,
                                        variantId: selectedVariant?._id,
                                        variantName: selectedVariant?.name,
                                        modifierIds: selectedModifiers,
                                        modifierNames: selectedModifiers.map((id) => item.modifiers.find((m) => m._id === id)?.name).filter(Boolean),
                                        unitPrice: calculateTotal(),
                                        displayed: displayedSelection(item, selectedVariant, selectedModifiers),
                                        qty,
                                    });
                                    onClose();
                                }}
                                className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-wider"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add - ${(calculateTotal() * qty).toFixed(2)}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={onClose}
                            className="w-full h-14 rounded-2xl font-bold uppercase tracking-wider"
                        >
                            {t('live_menu.got_it')}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
