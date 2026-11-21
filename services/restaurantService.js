// Client-side service for restaurant operations

export const RestaurantService = {
  /**
   * Creates a new restaurant
   * @param {Object} data - { name, restaurantId }
   * @returns {Promise<Object>} Created restaurant data
   */
  create: async (data) => {
    const res = await fetch("/api/restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to create restaurant");
    }

    return result;
  },

  /**
   * Checks if a restaurant ID (slug) is available
   * @param {string} slug 
   * @returns {Promise<boolean>}
   */
  checkAvailability: async (slug) => {
    if (!slug || slug.length < 3) return { available: false, message: "Too short" };
    
    const res = await fetch(`/api/restaurant/check-slug?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return { available: false, message: "Error checking" };
    
    return await res.json();
  }
};
