/**
 * Background Renderer
 * 
 * This module handles all background rendering logic for menus.
 * Supports: solid colors, gradients, patterns, images, and animations.
 * 
 * Philosophy: Generate styles at runtime based on config.
 * No hardcoded CSS classes - everything is dynamic.
 */

/**
 * Render background styles from config
 * Returns inline style object ready for React components
 * 
 * @param {object} config - Background configuration
 * @returns {object} React inline styles
 */
export function renderBackground(config) {
  if (!config || !config.type) {
    return { backgroundColor: '#FFFFFF' };
  }
  
  switch (config.type) {
    case 'solid':
      return renderSolidBackground(config);
    
    case 'gradient':
      return renderGradientBackground(config);
    
    case 'pattern':
      return renderPatternBackground(config);
    
    case 'image':
      return renderImageBackground(config);
    
    case 'animated':
      return renderAnimatedBackground(config);
    
    default:
      return { backgroundColor: '#FFFFFF' };
  }
}

/**
 * Solid color background
 */
function renderSolidBackground(config) {
  return {
    backgroundColor: config.color || '#FFFFFF'
  };
}

/**
 * Gradient background (linear or radial)
 */
function renderGradientBackground(config) {
  const { gradient } = config;
  
  if (!gradient || !gradient.stops || gradient.stops.length < 2) {
    return renderSolidBackground(config);
  }
  
  // Build gradient stops string
  const stops = gradient.stops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');
  
  if (gradient.type === 'radial') {
    return {
      background: `radial-gradient(circle, ${stops})`
    };
  }
  
  // Linear gradient (default)
  const angle = gradient.angle || 135;
  return {
    background: `linear-gradient(${angle}deg, ${stops})`
  };
}

/**
 * Pattern background (procedurally generated)
 */
function renderPatternBackground(config) {
  const { pattern, color } = config;
  
  if (!pattern || !pattern.type) {
    return renderSolidBackground(config);
  }
  
  // Import pattern generator
  const patternImage = generatePattern(pattern.type, {
    color: pattern.color || '#000000',
    opacity: pattern.opacity || 0.1,
    scale: pattern.scale || 1
  });
  
  const size = getPatternSize(pattern.type, pattern.scale || 1);
  
  return {
    backgroundColor: color || '#FFFFFF',
    backgroundImage: patternImage,
    backgroundSize: size,
    backgroundRepeat: 'repeat'
  };
}

/**
 * Image/video background
 */
function renderImageBackground(config) {
  const { media } = config;
  
  if (!media || !media.url) {
    return renderSolidBackground(config);
  }
  
  const styles = {
    backgroundImage: `url(${media.url})`,
    backgroundPosition: media.position || 'center',
    backgroundSize: media.size || 'cover',
    backgroundRepeat: 'no-repeat'
  };
  
  // Add blur filter if specified
  if (media.blur && media.blur > 0) {
    styles.filter = `blur(${media.blur}px)`;
  }
  
  // Add overlay if specified
  if (media.overlay) {
    const overlayColor = media.overlay.color || '#000000';
    const overlayOpacity = media.overlay.opacity || 0.5;
    const rgbaOverlay = hexToRgba(overlayColor, overlayOpacity);
    
    // Create layered background with overlay
    styles.backgroundImage = `linear-gradient(${rgbaOverlay}, ${rgbaOverlay}), url(${media.url})`;
  }
  
  return styles;
}

/**
 * Animated background (placeholder for future enhancement)
 */
function renderAnimatedBackground(config) {
  // For now, render as gradient with animation hint
  // Actual animation will be handled by CSS animations or framer-motion
  return {
    ...renderGradientBackground(config),
    transition: 'all 0.5s ease'
  };
}

/**
 * Generate pattern using CSS gradients or SVG
 * @param {string} type - Pattern type
 * @param {object} options - Pattern options (color, opacity, scale)
 * @returns {string} CSS background-image value
 */
function generatePattern(type, options) {
  const { color, opacity } = options;
  const rgba = hexToRgba(color, opacity);
  
  switch (type) {
    case 'dots':
      return `radial-gradient(circle, ${rgba} 1px, transparent 1px)`;
    
    case 'grid':
      return `
        linear-gradient(${rgba} 1px, transparent 1px),
        linear-gradient(90deg, ${rgba} 1px, transparent 1px)
      `;
    
    case 'waves':
      // SVG wave pattern (encoded as data URI)
      return generateWavePattern(color, opacity);
    
    case 'checkered':
      return `
        repeating-conic-gradient(
          ${rgba} 0% 25%,
          transparent 25% 50%
        )
      `;
    
    case 'diagonal':
      return `repeating-linear-gradient(
        45deg,
        ${rgba} 0px,
        ${rgba} 1px,
        transparent 1px,
        transparent 10px
      )`;
    
    case 'custom':
      // Custom pattern can be provided as SVG data URI
      return options.customPattern || generatePattern('dots', options);
    
    default:
      return `radial-gradient(circle, ${rgba} 1px, transparent 1px)`;
  }
}

/**
 * Get appropriate background-size for pattern type
 */
function getPatternSize(type, scale) {
  const baseSize = 20 * scale;
  
  switch (type) {
    case 'dots':
      return `${baseSize}px ${baseSize}px`;
    
    case 'grid':
      return `${baseSize}px ${baseSize}px`;
    
    case 'waves':
      return `${baseSize * 2}px ${baseSize}px`;
    
    case 'checkered':
      return `${baseSize * 2}px ${baseSize * 2}px`;
    
    case 'diagonal':
      return `${baseSize}px ${baseSize}px`;
    
    default:
      return `${baseSize}px ${baseSize}px`;
  }
}

/**
 * Generate SVG wave pattern
 */
function generateWavePattern(color, opacity) {
  const rgba = hexToRgba(color, opacity);
  
  // Create SVG wave
  const svg = `
    <svg width="100" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 10 Q 25 0, 50 10 T 100 10" 
            stroke="${color}" 
            stroke-opacity="${opacity}"
            stroke-width="1" 
            fill="none"/>
    </svg>
  `;
  
  // Encode as data URI
  const encoded = encodeURIComponent(svg.trim());
  return `url("data:image/svg+xml,${encoded}")`;
}

/**
 * Convert hex color to rgba with opacity
 * @param {string} hex - Hex color (#RGB or #RRGGBB)
 * @param {number} opacity - Opacity (0-1)
 * @returns {string} rgba() color string
 */
function hexToRgba(hex, opacity = 1) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Expand shorthand (e.g., "03F" -> "0033FF")
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get a preview style object for pattern selection UI
 * @param {string} type - Pattern type
 * @returns {object} Preview styles
 */
export function getPatternPreview(type) {
  return renderPatternBackground({
    pattern: {
      type,
      color: '#000000',
      opacity: 0.15,
      scale: 1
    },
    color: '#FFFFFF'
  });
}

/**
 * Helper: Check if background config is valid
 */
export function isValidBackground(config) {
  if (!config || typeof config !== 'object') return false;
  
  const validTypes = ['solid', 'gradient', 'pattern', 'image', 'animated'];
  return validTypes.includes(config.type);
}

// Export all functions
export {
  renderSolidBackground,
  renderGradientBackground,
  renderPatternBackground,
  renderImageBackground,
  renderAnimatedBackground,
  generatePattern,
  hexToRgba
};
