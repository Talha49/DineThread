"use client";

import { useMenuStore } from "@/hooks/use-menu-store";
import { useCategoryStore } from "@/hooks/use-category-store"; // For options
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { MenuItemCard } from "@/components/dashboard/MenuItemCard";
import { Plus, GripVertical, Info } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export function MenuItemsTab({ onCreateItem, onEditItem }) {
    const {
        items,
        isLoading,
        filters,
        setFilter,
        fetchItems,
        deleteItem,
        toggleAvailability
    } = useMenuStore();

    const { categories } = useCategoryStore();
    const categoryOptions = categories.map(c => ({ value: c.name, label: c.name }));

    const handleDeleteItem = async (id) => {
        if (confirm("Delete this item?")) {
            await deleteItem(id);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);

        useMenuStore.getState().reorderItems(newItems);
    };

    const isReorderingEnabled = filters.category !== 'all' || items.length < 50; // Enable it always but warn if too many

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/50 p-4 rounded-xl border backdrop-blur-sm shadow-sm">
                <SearchBar
                    value={filters.search}
                    onChange={(val) => {
                        setFilter("search", val);
                        fetchItems();
                    }}
                />
                <FilterSelect
                    value={filters.category}
                    onChange={(val) => {
                        setFilter("category", val);
                        setTimeout(() => fetchItems(), 0);
                    }}
                    options={categoryOptions}
                    placeholder="All Categories"
                />
                <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
                    {items.length} items found
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-80 rounded-xl bg-muted/80 animate-pulse" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/5">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Plus className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No items found</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-sm">
                        {filters.search || filters.category !== 'all'
                            ? "Try adjusting your filters to find what you're looking for."
                            : "Get started by adding your first delicious menu item!"}
                    </p>
                    <Button variant="outline" onClick={onCreateItem}>Add Item</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filters.category !== 'all' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-lg text-xs font-medium text-primary animate-in fade-in slide-in-from-top-1 duration-500">
                            <Info className="h-3.5 w-3.5" />
                            Drag items to change their display order in {filters.category}
                        </div>
                    )}

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="menu-items" direction="horizontal">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                >
                                    {items.map((item, index) => (
                                        <Draggable key={item._id} draggableId={item._id} index={index}>
                                            {(provided, snapshot) => (
                                                <MenuItemCard
                                                    provided={provided}
                                                    snapshot={snapshot}
                                                    item={item}
                                                    onDelete={handleDeleteItem}
                                                    onToggleAvailability={(id, status) => toggleAvailability(id, status)}
                                                    onEdit={onEditItem}
                                                />
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            )}
        </div>
    );
}
