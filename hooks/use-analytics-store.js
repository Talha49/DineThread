import { create } from 'zustand';

export const useAnalyticsStore = create((set, get) => ({
  summary: null,
  isLoading: false,
  error: null,

  fetchSummary: async (force = false) => {
    if (get().summary && !force) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/analytics/summary');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      set({ summary: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
