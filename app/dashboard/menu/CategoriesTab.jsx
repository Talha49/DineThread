"use client";

import { useState } from "react";
import { useCategoryStore } from "@/hooks/use-category-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Plus, Loader2, Save, X, Pencil, Trash2, Tag, ChevronDown, GripVertical } from "lucide-react";
import { CATEGORY_ICONS } from "@/utils/arrays/arrays";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

// Internal reusable Emoji Picker
const EmojiPicker = ({ selectedEmoji, onSelect, onClose, isOpen, toggleOpen }) => {
    return (
        <div className="relative">
            <Button
                type="button"
                variant="outline"
                className="h-11 w-14 text-2xl px-0 shrink-0"
                onClick={toggleOpen}
            >
                {selectedEmoji}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop for closing */}
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    {/* Dropdown */}
                    {/* Dropdown */}
                    <div className="absolute top-14 left-0 w-80 h-80 overflow-y-auto bg-background border rounded-xl shadow-2xl p-3 z-[9999] animate-in fade-in zoom-in-95 duration-200 grid grid-cols-4 gap-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent ring-1 ring-border">
                        {CATEGORY_ICONS.map((icon, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => onSelect(icon)}
                                className="flex flex-col items-center justify-center p-2 hover:bg-muted rounded-lg transition-all hover:scale-105 group"
                                title={icon.label}
                            >
                                <span className="text-3xl mb-1">{icon.emoji}</span>
                                <span className="text-[10px] text-muted-foreground truncate w-full text-center font-medium group-hover:text-foreground">
                                    {icon.key}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export function CategoriesTab() {
    const {
        categories,
        isLoading,
        createCategory,
        updateCategory,
        deleteCategory
    } = useCategoryStore();

    const [newCategoryName, setNewCategoryName] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("🍽️");
    const [showPresets, setShowPresets] = useState(false);

    // Edit state
    const [editingCatId, setEditingCatId] = useState(null);
    const [editingCatName, setEditingCatName] = useState("");
    const [editingEmoji, setEditingEmoji] = useState("");
    const [showEditPresets, setShowEditPresets] = useState(false);

    const [isCreatingCat, setIsCreatingCat] = useState(false);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setIsCreatingCat(true);
        const success = await createCategory(newCategoryName, selectedEmoji);
        if (success) {
            setNewCategoryName("");
            setSelectedEmoji("🍽️");
            setShowPresets(false);
        }
        setIsCreatingCat(false);
    };

    const handleUpdateCategory = async (id) => {
        if (!editingCatName.trim()) return;
        const success = await updateCategory(id, editingCatName, editingEmoji);
        if (success) {
            setEditingCatId(null);
            setShowEditPresets(false);
        }
    };

    const handleDeleteCategory = async (id, name) => {
        if (confirm(`Delete category "${name}"?`)) {
            await deleteCategory(id);
        }
    };

    const handleValidPresetSelect = (preset, isEdit = false) => {
        if (isEdit) {
            setEditingEmoji(preset.emoji);
            // Don't auto-set name in edit mode, user might just want to change icon
            setShowEditPresets(false);
        } else {
            setNewCategoryName(preset.label);
            setSelectedEmoji(preset.emoji);
            setShowPresets(false);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        useCategoryStore.getState().reorderCategories(items);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Creation Card */}
            <div className="bg-card/50 p-6 rounded-xl border backdrop-blur-sm shadow-sm relative z-10 transition-all hover:bg-card/80">
                <div className="flex flex-col gap-4">
                    <label className="text-sm font-medium text-muted-foreground block ml-1">Create New Category</label>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <EmojiPicker
                            selectedEmoji={selectedEmoji}
                            isOpen={showPresets}
                            toggleOpen={() => setShowPresets(!showPresets)}
                            onClose={() => setShowPresets(false)}
                            onSelect={(icon) => handleValidPresetSelect(icon, false)}
                        />

                        <div className="flex-1 w-full">
                            <div className="relative group">
                                <Input
                                    placeholder="Name (e.g. 'Starters')"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="pl-4 h-11 transition-all focus:ring-primary/20"
                                />
                                {newCategoryName.length === 0 && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-muted-foreground/50 text-xs">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button onClick={handleAddCategory} disabled={isCreatingCat || !newCategoryName.trim()} className="h-11 w-full sm:w-auto px-6">
                            {isCreatingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 w-full rounded-2xl bg-muted/20 animate-pulse" />)}
                </div>
            ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-2xl bg-muted/5">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <Tag className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
                    <p className="text-muted-foreground">Pick an emoji above to get started!</p>
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="categories" direction="horizontal" type="category">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {categories.map((cat, index) => (
                                    <Draggable key={cat._id} draggableId={cat._id} index={index}>
                                        {(provided, snapshot) => (
                                            <Card
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={cn(
                                                    "group relative overflow-visible transition-all duration-300 border-border/50 bg-card/50 hover:bg-card",
                                                    snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/50 scale-[1.02] z-[50]" : "hover:shadow-xl hover:-translate-y-1"
                                                )}
                                            >
                                                <div className="p-6">
                                                    {editingCatId === cat._id ? (
                                                        <div className="space-y-4 animate-in fade-in zoom-in-95 relative z-20">
                                                            <div className="flex gap-3 items-start">
                                                                <EmojiPicker
                                                                    selectedEmoji={editingEmoji}
                                                                    isOpen={showEditPresets}
                                                                    toggleOpen={() => setShowEditPresets(!showEditPresets)}
                                                                    onClose={() => setShowEditPresets(false)}
                                                                    onSelect={(icon) => handleValidPresetSelect(icon, true)}
                                                                />
                                                                <Input
                                                                    value={editingCatName}
                                                                    onChange={(e) => setEditingCatName(e.target.value)}
                                                                    autoFocus
                                                                    className="flex-1 h-11 text-base bg-background"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end gap-3 pt-2">
                                                                <Button size="sm" variant="ghost" onClick={() => { setEditingCatId(null); setShowEditPresets(false); }}>
                                                                    Cancel
                                                                </Button>
                                                                <Button size="sm" onClick={() => handleUpdateCategory(cat._id)}>
                                                                    Save Changes
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-5">
                                                                {/* Drag Handle */}
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/30 hover:text-primary transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <GripVertical className="h-5 w-5" />
                                                                </div>

                                                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-4xl shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-300">
                                                                    {cat.emoji || "🍽️"}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-xl leading-tight tracking-tight">{cat.name}</h3>
                                                                    <p className="text-xs text-muted-foreground mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                                                        Manage items
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/95 backdrop-blur-md rounded-xl p-1.5 absolute right-3 top-3 border shadow-lg z-10 translate-x-2 group-hover:translate-x-0">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg" onClick={() => {
                                                                    setEditingCatId(cat._id);
                                                                    setEditingCatName(cat.name);
                                                                    setEditingEmoji(cat.emoji || "🍽️");
                                                                    setShowEditPresets(false);
                                                                }}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg" onClick={() => handleDeleteCategory(cat._id, cat.name)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
}
