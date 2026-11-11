/**
 * MASTER RESTAURANT CATEGORY ICON LIST
 * ----------------------------------
 * Purpose:
 * - Centralized category definitions
 * - Emoji-based icons (no images, no storage)
 * - Used for category creation & display
 *
 * Rules:
 * - Categories = logical grouping (NOT dishes)
 * - One emoji per category
 * - Safe for DB storage and UI rendering
 */

export const CATEGORY_ICONS = [

  /* ===============================
     CORE MENU STRUCTURE
     =============================== */
  { key: "starters", label: "Starters / Appetizers", emoji: "🥗" },
  { key: "main_course", label: "Main Course", emoji: "🍽️" },
  { key: "side_dishes", label: "Side Dishes", emoji: "🍟" },
  { key: "snacks", label: "Snacks", emoji: "🍿" },
  { key: "combos", label: "Combos / Deals", emoji: "🎉" },

  /* ===============================
     MEAL TIME CATEGORIES
     =============================== */
  { key: "breakfast", label: "Breakfast", emoji: "🍳" },
  { key: "brunch", label: "Brunch", emoji: "🥞" },
  { key: "lunch", label: "Lunch", emoji: "🍱" },
  { key: "dinner", label: "Dinner", emoji: "🍛" },
  { key: "late_night", label: "Late Night", emoji: "🌙" },

  /* ===============================
     FOOD STYLE / COOKING METHOD
     =============================== */
  { key: "fast_food", label: "Fast Food", emoji: "🍔" },
  { key: "street_food", label: "Street Food", emoji: "🌮" },
  { key: "bbq_grill", label: "BBQ / Grill", emoji: "🔥" },
  { key: "fried", label: "Fried", emoji: "🍗" },
  { key: "baked", label: "Baked", emoji: "🥖" },
  { key: "steamed", label: "Steamed", emoji: "♨️" },
  { key: "roasted", label: "Roasted", emoji: "🍖" },
  { key: "chef_special", label: "Chef’s Special", emoji: "👨‍🍳" },

  /* ===============================
     CUISINE / REGION BASED
     =============================== */
  { key: "local_cuisine", label: "Local Cuisine", emoji: "🏠" },
  { key: "asian", label: "Asian", emoji: "🥢" },
  { key: "chinese", label: "Chinese", emoji: "🥡" },
  { key: "italian", label: "Italian", emoji: "🍝" },
  { key: "indian", label: "Indian", emoji: "🍛" },
  { key: "middle_eastern", label: "Middle Eastern", emoji: "🧆" },
  { key: "mexican", label: "Mexican", emoji: "🌮" },
  { key: "continental", label: "Continental", emoji: "🍽️" },
  { key: "fusion", label: "Fusion", emoji: "🔀" },

  /* ===============================
     INGREDIENT / DIET BASED
     =============================== */
  { key: "vegetarian", label: "Vegetarian", emoji: "🥕" },
  { key: "vegan", label: "Vegan", emoji: "🌱" },
  { key: "non_vegetarian", label: "Non-Vegetarian", emoji: "🍖" },
  { key: "seafood", label: "Seafood", emoji: "🦐" },
  { key: "chicken", label: "Chicken Based", emoji: "🍗" },
  { key: "beef", label: "Beef Based", emoji: "🥩" },

  /* ===============================
     BAKERY & DESSERTS
     =============================== */
  { key: "bakery", label: "Bakery", emoji: "🥐" },
  { key: "desserts", label: "Desserts", emoji: "🍰" },
  { key: "cakes", label: "Cakes", emoji: "🎂" },
  { key: "pastries", label: "Pastries", emoji: "🧁" },
  { key: "ice_cream", label: "Ice Cream", emoji: "🍨" },
  { key: "sweets", label: "Sweets", emoji: "🍬" },

  /* ===============================
     BEVERAGES
     =============================== */
  { key: "beverages", label: "Beverages", emoji: "🥤" },
  { key: "soft_drinks", label: "Soft Drinks", emoji: "🥤" },
  { key: "coffee", label: "Coffee", emoji: "☕" },
  { key: "tea", label: "Tea", emoji: "🍵" },
  { key: "juices", label: "Juices", emoji: "🧃" },
  { key: "shakes", label: "Shakes", emoji: "🥛" },
  { key: "mocktails", label: "Mocktails", emoji: "🍹" },

  /* ===============================
     SPECIAL & DIETARY
     =============================== */
  { key: "kids_menu", label: "Kids Menu", emoji: "🧒" },
  { key: "healthy", label: "Healthy", emoji: "🥦" },
  { key: "low_calorie", label: "Low Calorie", emoji: "⚖️" },
  { key: "gluten_free", label: "Gluten Free", emoji: "🌾" },
  { key: "organic", label: "Organic", emoji: "🌾" },

  /* ===============================
     BUSINESS / PROMOTIONAL
     =============================== */
  { key: "best_seller", label: "Best Seller", emoji: "⭐" },
  { key: "new_arrivals", label: "New Arrivals", emoji: "🆕" },
  { key: "seasonal", label: "Seasonal", emoji: "🍁" },
  { key: "limited_time", label: "Limited Time", emoji: "⏳" },
  { key: "offers", label: "Offers & Discounts", emoji: "🏷️" }

];
