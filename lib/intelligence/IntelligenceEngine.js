/**
 * SmartMenu Intelligence Engine
 * 
 * Logic for menu optimization, heatmap generation, and dynamic pricing.
 */

/**
 * Generate simulated heatmap data for a list of items
 * @param {Array} items - List of menu items
 * @returns {Object} Map of itemId -> popularity score (0-100)
 */
export function generateMockHeatmap(items) {
  const heatmap = {};
  
  items.forEach((item, index) => {
    // Simulate higher popularity for first 2 items and some random ones
    let score = Math.floor(Math.random() * 40) + 20;
    if (index < 2) score += 40;
    if (item.name.toLowerCase().includes('special') || item.name.toLowerCase().includes('signature')) {
      score += 30;
    }
    
    heatmap[item._id] = Math.min(score, 100);
  });
  
  return heatmap;
}

/**
 * Calculate dynamic price based on rules
 * @param {number} basePrice - Original price
 * @param {Array} rules - Pricing rules
 * @returns {Object} { price: number, isDiscounted: boolean, activeRule: string }
 */
export function calculateDynamicPrice(basePrice, rules = []) {
  if (!rules || rules.length === 0) return { price: basePrice, isDiscounted: false };

  const now = new Date();
  const currentDay = now.getDay(); // 0-6
  const currentHour = now.getHours();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    // Check day
    if (rule.days && !rule.days.includes(currentDay)) continue;

    // Check time
    if (rule.startTime && rule.endTime) {
      const [startH] = rule.startTime.split(':').map(Number);
      const [endH] = rule.endTime.split(':').map(Number);
      if (currentHour < startH || currentHour >= endH) continue;
    }

    // Apply discount
    let finalPrice = basePrice;
    if (rule.type === 'percentage') {
      finalPrice = basePrice * (1 - rule.value / 100);
    } else if (rule.type === 'fixed') {
      finalPrice = basePrice - rule.value;
    }

    return {
      price: Math.max(0, parseFloat(finalPrice.toFixed(2))),
      isDiscounted: true,
      activeRule: rule.name
    };
  }

  return { price: basePrice, isDiscounted: false };
}

/**
 * Suggest optimal menu layout
 * Simple heuristic: High margin + High popularity = Top
 */
export function suggestOptimalLayout(items, heatmap) {
  return [...items].sort((a, b) => {
    const scoreA = (heatmap[a._id] || 0) + (a.margin || 0);
    const scoreB = (heatmap[b._id] || 0) + (b.margin || 0);
    return scoreB - scoreA;
  });
}
