export const CategoryService = {
  async getCategories() {
    const res = await fetch("/api/categories");
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to fetch categories");
    return json.categories || [];
  },

  async createCategory(name, emoji) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create category");
    return json.category;
  },

  async updateCategory(id, name, emoji) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update category");
    return json.category;
  },

  async deleteCategory(id) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to delete category");
    return true;
  },

  async reorderCategories(categoryIds) {
    const res = await fetch("/api/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryIds }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to reorder categories");
    return true;
  },
};
