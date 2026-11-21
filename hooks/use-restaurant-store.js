import { create } from 'zustand';
import { deepMerge } from '@/lib/object-utils';

// Global store for restaurant data to avoid prop drilling and frequent refetches
export const useRestaurantStore = create((set, get) => ({
  restaurant: null,
  previewData: null,
  isLoading: false,
  error: null,

  setRestaurant: (data) => set({ restaurant: data, previewData: data }),
  
  setPreviewData: (data) => set((state) => ({
    previewData: state.previewData ? deepMerge(state.previewData, data) : data
  })),

  resetPreview: () => set((state) => ({ previewData: state.restaurant })),
  
  // Fetch restaurant details using the authenticated session
  fetchRestaurant: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/restaurant/me');
      if (!res.ok) {
         if(res.status === 404) {
             set({ restaurant: null, isLoading: false });
             return;
         }
         throw new Error('Failed to fetch restaurant');
      }
      const data = await res.json();
      set({ restaurant: data, previewData: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateBranding: async (formData) => {
    const previousState = get().restaurant;
    
    // Optimistic update using deep merge to preserve nested state (like experienceConfig)
    set((state) => ({
      restaurant: deepMerge(state.restaurant, formData)
    }));

    try {
      const res = await fetch("/api/restaurant/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save settings");
      }

      const data = await res.json();
      set({ restaurant: data.restaurant });
      return { success: true };
    } catch (error) {
      set({ restaurant: previousState });
      return { success: false, error: error.message };
    }
  },

  updateBusinessProfile: async (formData) => {
    const previousState = get().restaurant;
    
    // 1. Optimistic Update
    set((state) => ({
      restaurant: { ...state.restaurant, ...formData }
    }));

    try {
      const res = await fetch("/api/restaurant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save profile");
      }

      const data = await res.json();
      set({ restaurant: data.restaurant });
      return { success: true };
    } catch (error) {
      set({ restaurant: previousState });
      return { success: false, error: error.message };
    }
  }
}));
