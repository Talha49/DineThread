import { create } from 'zustand';
import { MenuService } from '@/services/menuService';
import toast from 'react-hot-toast';

export const useMenuStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: 'all',
  },
  focusedItemId: null,

  setFocusedItem: (id) => {
    set({ focusedItemId: id });
    if (id) {
      setTimeout(() => set({ focusedItemId: null }), 3000); // Clear after 3s
    }
  },

  setFilter: (key, value) => set((state) => ({ 
    filters: { ...state.filters, [key]: value } 
  })),

  fetchItems: async (force = false) => {
    const { filters, items } = get();
    
    // Only skip if we have items, no search/category filter active, and not forcing
    const isFiltered = filters.search || filters.category !== 'all';
    if (items.length > 0 && !isFiltered && !force) return;

    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category !== 'all') params.category = filters.category;

      const data = await MenuService.getMenuItems(params);
      set({ items: data.items || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createItem: async (data) => {
    try {
      await MenuService.createMenuItem(data);
      toast.success("Item created");
      get().fetchItems(true); // Force refresh to show new item
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  },

  updateItem: async (id, data) => {
    try {
      await MenuService.updateMenuItem(id, data);
      toast.success("Item updated");
      get().fetchItems(true); // Force refresh
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  },

  deleteItem: async (id) => {
    try {
      await MenuService.deleteMenuItem(id);
      toast.success("Item deleted");
      // Optimistic update
      set((state) => ({ items: state.items.filter((i) => i._id !== id) }));
    } catch (error) {
      toast.error(error.message);
      get().fetchItems(true); // Revert on fail
    }
  },

  toggleAvailability: async (id, targetStatus) => {
    // Optimistic update
    set((state) => ({
      items: state.items.map((i) => 
        i._id === id ? { ...i, isAvailable: targetStatus } : i
      )
    }));

    try {
      await MenuService.toggleAvailability(id, targetStatus);
    } catch (error) {
      toast.error("Failed to update status");
      // Revert if we have items
      set((state) => ({
        items: state.items.map((i) => 
            i._id === id ? { ...i, isAvailable: !targetStatus } : i
        )
      }));
    }
  },

  toggleFeatured: async (id, targetStatus) => {
    // Optimistic update
    set((state) => ({
      items: state.items.map((i) => 
        i._id === id ? { ...i, isFeatured: targetStatus } : i
      )
    }));

    try {
      await MenuService.updateMenuItem(id, { isFeatured: targetStatus });
    } catch (error) {
      toast.error("Failed to update featured status");
      // Revert
      set((state) => ({
        items: state.items.map((i) => 
            i._id === id ? { ...i, isFeatured: !targetStatus } : i
        )
      }));
    }
  },

  reorderItems: async (newItems) => {
    const previousItems = get().items;
    
    // 1. Optimistic Update
    set({ items: newItems });

    try {
      // 2. Sync with Server
      const ids = newItems.map(i => i._id);
      await MenuService.reorderMenuItems(ids);
    } catch (error) {
      // 3. Rollback
      set({ items: previousItems });
      toast.error("Failed to save menu order. Rolling back...");
    }
  }
}));
