export const MenuService = {
  async getMenuItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/menu?${query}`);
    if (!res.ok) throw new Error("Failed to fetch menu items");
    return res.json();
  },

  async createMenuItem(data) {
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create item");
    return json;
  },

  async updateMenuItem(id, data) {
    const res = await fetch(`/api/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update item");
    return json;
  },

  async deleteMenuItem(id) {
    const res = await fetch(`/api/menu/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete item");
    return true;
  },

  async toggleAvailability(id, isAvailable) {
    const res = await fetch(`/api/menu/${id}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable }),
    });
    if (!res.ok) throw new Error("Failed to update availability");
    return true;
  },

  async reorderMenuItems(itemIds) {
    const res = await fetch("/api/menu/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to reorder menu items");
    return true;
  },
};
