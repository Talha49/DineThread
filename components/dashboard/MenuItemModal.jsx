"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Loader2, Star, Plus, X, DollarSign, Layers, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCategoryStore } from "@/hooks/use-category-store";
import { cn } from "@/lib/utils";

function CategorySelect({ value, onChange }) {
    const { categories } = useCategoryStore();

    return (
        <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="" disabled>Select a category</option>
            {!categories.some(c => c.name === value) && value && <option value={value}>{value}</option>}

            {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
        </select>
    );
}

export function MenuItemModal({ isOpen, onClose, initialData, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [hasVariants, setHasVariants] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        imageUrl: "",
        isAvailable: true,
        isFeatured: false,
        variants: [],
        modifiers: []
    });

    // Reset form when modal opens/closes or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const hasExistingVariants = !!(initialData.variants && initialData.variants.length > 0);
                setHasVariants(hasExistingVariants);
                setFormData({
                    ...initialData,
                    price: initialData.price?.toString() || "",
                    isFeatured: initialData.isFeatured || false,
                    variants: initialData.variants || [],
                    modifiers: initialData.modifiers || []
                });
            } else {
                setHasVariants(false);
                setFormData({
                    name: "",
                    price: "",
                    description: "",
                    category: "",
                    imageUrl: "",
                    isAvailable: true,
                    isFeatured: false,
                    variants: [],
                    modifiers: []
                });
            }
            setActiveTab("basic");
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (url) => {
        setFormData(prev => ({ ...prev, imageUrl: url }));
    };

    // Variant Management
    const addVariant = () => {
        const newVariant = {
            name: "",
            price: "",
            isDefault: formData.variants.length === 0
        };
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, newVariant]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => {
            const newVariants = prev.variants.filter((_, i) => i !== index);
            // If we removed the default, make the first one default
            if (newVariants.length > 0 && !newVariants.some(v => v.isDefault)) {
                newVariants[0].isDefault = true;
            }
            return { ...prev, variants: newVariants };
        });
    };

    const updateVariant = (index, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            if (field === "isDefault" && value) {
                // Unset all other defaults
                newVariants.forEach((v, i) => {
                    v.isDefault = i === index;
                });
            } else {
                newVariants[index] = { ...newVariants[index], [field]: value };
            }
            return { ...prev, variants: newVariants };
        });
    };

    // Modifier Management
    const addModifier = () => {
        const newModifier = {
            name: "",
            price: "",
            category: ""
        };
        setFormData(prev => ({
            ...prev,
            modifiers: [...prev.modifiers, newModifier]
        }));
    };

    const removeModifier = (index) => {
        setFormData(prev => ({
            ...prev,
            modifiers: prev.modifiers.filter((_, i) => i !== index)
        }));
    };

    const updateModifier = (index, field, value) => {
        setFormData(prev => {
            const newModifiers = [...prev.modifiers];
            newModifiers[index] = { ...newModifiers[index], [field]: value };
            return { ...prev, modifiers: newModifiers };
        });
    };

    const handleVariantsToggle = (enabled) => {
        setHasVariants(enabled);
        if (enabled && formData.variants.length === 0) {
            // Add a default variant
            setFormData(prev => ({
                ...prev,
                variants: [{ name: "Regular", price: prev.price || "", isDefault: true }]
            }));
        } else if (!enabled) {
            setFormData(prev => ({ ...prev, variants: [] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (hasVariants) {
                if (formData.variants.length === 0) {
                    toast.error("Please add at least one size option");
                    setLoading(false);
                    return;
                }
                if (!formData.variants.some(v => v.isDefault)) {
                    toast.error("Please mark one variant as default");
                    setLoading(false);
                    return;
                }
                if (formData.variants.some(v => !v.name || v.price === "")) {
                    toast.error("All variants must have a name and price");
                    setLoading(false);
                    return;
                }
            } else if (formData.price === "") {
                toast.error("Please provide a price");
                setLoading(false);
                return;
            }

            // Check modifiers
            if (formData.modifiers.length > 0) {
                if (formData.modifiers.some(m => !m.name || m.price === "")) {
                    toast.error("All modifiers must have a name and price");
                    setLoading(false);
                    return;
                }
            }

            const url = initialData ? `/api/menu/${initialData._id}` : `/api/menu`;
            const method = initialData ? "PUT" : "POST";

            // Prepare Payload
            const payload = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                imageUrl: formData.imageUrl,
                isAvailable: formData.isAvailable,
                isFeatured: formData.isFeatured,
                // Primary price: If variants exist, use the default variant's price
                price: hasVariants
                    ? parseFloat(formData.variants.find(v => v.isDefault)?.price || 0)
                    : parseFloat(formData.price || 0),
                variants: hasVariants ? formData.variants.map(v => ({
                    name: v.name.trim(),
                    price: parseFloat(v.price),
                    isDefault: v.isDefault
                })) : [],
                modifiers: formData.modifiers.map(m => ({
                    name: m.name.trim(),
                    price: parseFloat(m.price),
                    category: m.category?.trim() || ""
                }))
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            toast.success(initialData ? "Item updated!" : "Item created!");
            onRefresh();
            onClose();

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Menu Item" : "New Menu Item"} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="basic" className="gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Basic Info
                        </TabsTrigger>
                        <TabsTrigger value="pricing" className="gap-2">
                            <DollarSign className="w-4 h-4" />
                            Pricing
                        </TabsTrigger>
                        <TabsTrigger value="addons" className="gap-2">
                            <Layers className="w-4 h-4" />
                            Add-ons
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Basic Info */}
                    <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Item Image</label>
                            <ImageUpload
                                value={formData.imageUrl}
                                onChange={handleImageChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Name"
                                name="name"
                                placeholder="e.g. Truffle Burger"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Category</label>
                                <CategorySelect
                                    value={formData.category}
                                    onChange={(val) => setFormData({ ...formData, category: val })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Description</label>
                            <textarea
                                name="description"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Delicious beef patty with truffle mayo..."
                                value={formData.description}
                                onChange={handleChange}
                                maxLength={200}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 border-border/50 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-yellow-500/10 text-yellow-500">
                                    <Star className="h-4 w-4 fill-current" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Top Pick</p>
                                    <p className="text-[10px] text-muted-foreground">Highlight this item at the top of the menu</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 px-3 gap-2 transition-all",
                                    formData.isFeatured ? "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm" : "border text-muted-foreground hover:bg-muted"
                                )}
                                onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                            >
                                {formData.isFeatured ? "Featured" : "Set Featured"}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Pricing & Variants */}
                    <TabsContent value="pricing" className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/10">
                            <div>
                                <p className="text-sm font-medium">This item has size options</p>
                                <p className="text-xs text-muted-foreground mt-1">Enable to add Small, Medium, Large, etc.</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 px-3 transition-all",
                                    hasVariants ? "bg-primary text-white hover:bg-primary/90" : "border hover:bg-muted"
                                )}
                                onClick={() => handleVariantsToggle(!hasVariants)}
                            >
                                {hasVariants ? "Enabled" : "Disabled"}
                            </Button>
                        </div>

                        {!hasVariants ? (
                            <div className="relative">
                                <Input
                                    label="Price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="15.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="absolute right-3 top-[34px] text-muted-foreground text-sm">$</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Size Options</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addVariant}
                                        className="h-8 gap-2"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Size
                                    </Button>
                                </div>

                                {formData.variants.length === 0 ? (
                                    <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                                        No size options yet. Click "Add Size" to get started.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {formData.variants.map((variant, index) => (
                                            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-background">
                                                <input
                                                    type="radio"
                                                    name="defaultVariant"
                                                    checked={variant.isDefault}
                                                    onChange={() => updateVariant(index, "isDefault", true)}
                                                    className="w-4 h-4"
                                                    title="Set as default"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Small"
                                                    value={variant.name}
                                                    onChange={(e) => updateVariant(index, "name", e.target.value)}
                                                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                />
                                                <div className="relative w-24">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="10.00"
                                                        value={variant.price}
                                                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                                                        className="w-full h-9 rounded-md border border-input bg-background px-3 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVariant(index)}
                                                    className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Select the radio button to mark a size as the default selection.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab 3: Add-ons & Modifiers */}
                    <TabsContent value="addons" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Add-ons & Extras</label>
                                <p className="text-xs text-muted-foreground mt-1">Optional toppings, sides, or customizations</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addModifier}
                                className="h-8 gap-2"
                            >
                                <Plus className="w-3 h-3" />
                                Add Modifier
                            </Button>
                        </div>

                        {formData.modifiers.length === 0 ? (
                            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-lg">
                                No add-ons yet. Click "Add Modifier" to create optional extras.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {formData.modifiers.map((modifier, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-background">
                                        <input
                                            type="text"
                                            placeholder="e.g. Extra Cheese"
                                            value={modifier.name}
                                            onChange={(e) => updateModifier(index, "name", e.target.value)}
                                            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                        <div className="relative w-24">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="2.00"
                                                value={modifier.price}
                                                onChange={(e) => updateModifier(index, "price", e.target.value)}
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Category (optional)"
                                            value={modifier.category || ""}
                                            onChange={(e) => updateModifier(index, "category", e.target.value)}
                                            className="w-32 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeModifier(index)}
                                            className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <div className="pt-4 flex justify-end gap-2 border-t">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading}>
                        {initialData ? "Save Changes" : "Create Item"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
