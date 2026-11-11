/**
 * Seasonal Theme Overlays
 * 
 * Partial theme configurations that can be applied on top of base themes
 * for seasonal events (Christmas, Halloween, Summer, etc.)
 */

/**
 * Christmas Overlay - Festive red & green
 */
export const CHRISTMAS_OVERLAY = {
  colors: {
    brand: {
      primary: '#C41E3A', // Christmas red
      secondary: '#165B33', // Christmas green
      tertiary: '#FFD700'  // Gold
    },
    semantic: {
      success: '#165B33',
      info: '#5B9BD5'
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'snowflake-1',
        type: 'emoji',
        content: '❄️',
        position: { x: '5%', y: '10%' },
        size: { width: 40, height: 40 },
        opacity: 0.6,
        animation: 'float'
      },
      {
        id: 'snowflake-2',
        type: 'emoji',
        content: '❄️',
        position: { x: '90%', y: '15%' },
        size: { width: 50, height: 50 },
        opacity: 0.5,
        animation: 'float'
      },
      {
        id: 'tree-1',
        type: 'emoji',
        content: '🎄',
        position: { x: '95%', y: '80%' },
        size: { width: 60, height: 60 },
        opacity: 0.7
      }
    ]
  }
};

/**
 * Halloween Overlay - Spooky orange & black
 */
export const HALLOWEEN_OVERLAY = {
  colors: {
    brand: {
      primary: '#FF6600', // Pumpkin orange
      secondary: '#1a1a1a', // Black
      tertiary: '#8B4789'  // Purple
    }
  },
  background: {
    type: 'pattern',
    color: '#1a1a1a',
    pattern: {
      type: 'dots',
      color: '#FF6600',
      opacity: 0.15,
      scale: 1.5
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'pumpkin-1',
        type: 'emoji',
        content: '🎃',
        position: { x: '3%', y: '5%' },
        size: { width: 50, height: 50 },
        opacity: 0.8
      },
      {
        id: 'ghost-1',
        type: 'emoji',
        content: '👻',
        position: { x: '92%', y: '10%' },
        size: { width: 45, height: 45 },
        opacity: 0.7,
        animation: 'float'
      }
    ]
  }
};

/**
 * Summer Overlay - Bright & vibrant
 */
export const SUMMER_OVERLAY = {
  colors: {
    brand: {
      primary: '#FFD700', // Sunny yellow
      secondary: '#00CED1', // Turquoise
      tertiary: '#FF6B6B'  // Coral
    }
  },
  background: {
    type: 'gradient',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#FFE5B4', position: 0 },
        { color: '#87CEEB', position: 100 }
      ]
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'sun-1',
        type: 'emoji',
        content: '☀️',
        position: { x: '90%', y: '5%' },
        size: { width: 60, height: 60 },
        opacity: 0.9
      },
      {
        id: 'palm-1',
        type: 'emoji',
        content: '🌴',
        position: { x: '5%', y: '85%' },
        size: { width: 55, height: 55 },
        opacity: 0.7
      }
    ]
  }
};

/**
 * Autumn Overlay - Warm fall colors
 */
export const AUTUMN_OVERLAY = {
  colors: {
    brand: {
      primary: '#D2691E', // Burnt orange
      secondary: '#8B4513', // Saddle brown
      tertiary: '#DAA520'  // Goldenrod
    }
  },
  background: {
    type: 'gradient',
    gradient: {
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#FFF8DC', position: 0 },
        { color: '#FFE4B5', position: 100 }
      ]
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'leaf-1',
        type: 'emoji',
        content: '🍂',
        position: { x: '10%', y: '8%' },
        size: { width: 40, height: 40 },
        opacity: 0.7,
        animation: 'fall'
      },
      {
        id: 'leaf-2',
        type: 'emoji',
        content: '🍁',
        position: { x: '88%', y: '12%' },
        size: { width: 45, height: 45 },
        opacity: 0.8,
        animation: 'fall'
      }
    ]
  }
};

/**
 * Winter Zen Overlay - Deep blues & ice
 */
export const WINTER_ZEN_OVERLAY = {
  colors: {
    brand: {
      primary: '#0F172A', // Midnight blue
      secondary: '#38BDF8', // Ice blue
      tertiary: '#F1F5F9'  // Silver
    }
  },
  background: {
    type: 'gradient',
    gradient: {
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#0F172A', position: 0 },
        { color: '#1E293B', position: 100 }
      ]
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'snowflake-3',
        type: 'emoji',
        content: '❄️',
        position: { x: '10%', y: '5%' },
        size: { width: 30, height: 30 },
        opacity: 0.4,
        animation: 'fall'
      },
      {
        id: 'star-1',
        type: 'emoji',
        content: '✨',
        position: { x: '85%', y: '15%' },
        size: { width: 20, height: 20 },
        opacity: 0.8,
        animation: 'pulse'
      }
    ]
  }
};

/**
 * Spring Blossom Overlay - Pastel pinks & soft greens
 */
export const SPRING_BLOSSOM_OVERLAY = {
  colors: {
    brand: {
      primary: '#DB2777', // Rose pink
      secondary: '#BEF264', // Lime green
      tertiary: '#FDF2F8'  // Soft blush
    }
  },
  background: {
    type: 'gradient',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#FDF2F8', position: 0 },
        { color: '#FCE7F3', position: 100 }
      ]
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'flower-1',
        type: 'emoji',
        content: '🌸',
        position: { x: '5%', y: '10%' },
        size: { width: 40, height: 40 },
        opacity: 0.7,
        animation: 'float'
      },
      {
        id: 'flower-2',
        type: 'emoji',
        content: '🌷',
        position: { x: '90%', y: '80%' },
        size: { width: 45, height: 45 },
        opacity: 0.6
      }
    ]
  }
};

/**
 * Golden Meadow Overlay - Warm yellows & meadow vibes
 */
export const GOLDEN_MEADOW_OVERLAY = {
  colors: {
    brand: {
      primary: '#F59E0B', // Amber
      secondary: '#10B981', // Emerald
      tertiary: '#FEF3C7'  // Cream
    }
  },
  background: {
    type: 'pattern',
    color: '#FEF3C7',
    pattern: {
      type: 'dots',
      color: '#F59E0B',
      opacity: 0.1
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'bee-1',
        type: 'emoji',
        content: '🐝',
        position: { x: '80%', y: '15%' },
        size: { width: 30, height: 30 },
        opacity: 0.8,
        animation: 'float'
      },
      {
        id: 'flower-3',
        type: 'emoji',
        content: '🌼',
        position: { x: '15%', y: '85%' },
        size: { width: 40, height: 40 },
        opacity: 0.7
      }
    ]
  }
};

/**
 * Valentine's Day Overlay - Romantic pink & red
 */
export const VALENTINES_OVERLAY = {
  colors: {
    brand: {
      primary: '#FF1493', // Deep pink
      secondary: '#FFB6C1', // Light pink
      tertiary: '#DC143C'  // Crimson
    }
  },
  background: {
    type: 'gradient',
    gradient: {
      type: 'radial',
      stops: [
        { color: '#FFF1F2', position: 0 },
        { color: '#FFE4E6', position: 100 }
      ]
    }
  },
  decorations: {
    enabled: true,
    elements: [
      {
        id: 'heart-1',
        type: 'emoji',
        content: '💕',
        position: { x: '5%', y: '5%' },
        size: { width: 50, height: 50 },
        opacity: 0.7
      },
      {
        id: 'heart-2',
        type: 'emoji',
        content: '💖',
        position: { x: '92%', y: '10%' },
        size: { width: 45, height: 45 },
        opacity: 0.6,
        animation: 'pulse'
      }
    ]
  }
};

/**
 * All seasonal overlays with date ranges
 */
export const SEASONAL_OVERLAYS = {
  winter_zen: {
    name: 'Winter Zen',
    overlay: WINTER_ZEN_OVERLAY,
    dateRange: { start: { month: 1, day: 1 }, end: { month: 1, day: 31 } },
    emoji: '🏔️'
  },
  valentines: {
    name: "Valentine's Day",
    overlay: VALENTINES_OVERLAY,
    dateRange: { start: { month: 2, day: 1 }, end: { month: 2, day: 14 } },
    emoji: '💕'
  },
  spring_blossom: {
    name: 'Spring Blossom',
    overlay: SPRING_BLOSSOM_OVERLAY,
    dateRange: { start: { month: 3, day: 1 }, end: { month: 4, day: 30 } },
    emoji: '🌸'
  },
  golden_meadow: {
    name: 'Golden Meadow',
    overlay: GOLDEN_MEADOW_OVERLAY,
    dateRange: { start: { month: 5, day: 1 }, end: { month: 5, day: 31 } },
    emoji: '🌼'
  },
  summer: {
    name: 'Summer',
    overlay: SUMMER_OVERLAY,
    dateRange: { start: { month: 6, day: 1 }, end: { month: 8, day: 31 } },
    emoji: '☀️'
  },
  autumn: {
    name: 'Autumn',
    overlay: AUTUMN_OVERLAY,
    dateRange: { start: { month: 9, day: 1 }, end: { month: 11, day: 30 } },
    emoji: '🍂'
  },
  christmas: {
    name: 'Christmas',
    overlay: CHRISTMAS_OVERLAY,
    dateRange: { start: { month: 12, day: 1 }, end: { month: 12, day: 31 } },
    emoji: '🎄'
  },
  halloween: {
    name: 'Halloween',
    overlay: HALLOWEEN_OVERLAY,
    dateRange: { start: { month: 10, day: 15 }, end: { month: 10, day: 31 } },
    emoji: '🎃'
  }
};

/**
 * Get active seasonal overlay based on current date
 */
export function getActiveSeasonalOverlay() {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  const day = now.getDate();
  
  for (const [id, season] of Object.entries(SEASONAL_OVERLAYS)) {
    const { start, end } = season.dateRange;
    
    // Check if current date is within range
    if (isDateInRange(month, day, start, end)) {
      return { id, ...season };
    }
  }
  
  return null;
}

/**
 * Helper: Check if date is in range
 */
function isDateInRange(month, day, start, end) {
  const currentDate = month * 100 + day; // e.g., Dec 25 = 1225
  const startDate = start.month * 100 + start.day;
  const endDate = end.month * 100 + end.day;
  
  // Handle year wrap-around (e.g., Dec-Jan)
  if (startDate > endDate) {
    return currentDate >= startDate || currentDate <= endDate;
  }
  
  return currentDate >= startDate && currentDate <= endDate;
}
