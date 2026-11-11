/**
 * Utility: Remove undefined values from object
 * Deeply cleans an object, removing any undefined values
 */
export function removeUndefined(obj) {
  // If not an object or is null, return as is
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj
      .map(item => removeUndefined(item))
      .filter(item => item !== undefined);
  }

  // Special check: If this is NOT a plain object (e.g. Mongoose doc, Date, etc.)
  // we should be very careful. For our purposes, we only want to clean data objects.
  const isPlainObject = obj.constructor === Object || Object.getPrototypeOf(obj) === null;
  if (!isPlainObject) {
    // If it has a toObject method (Mongoose), use it
    if (typeof obj.toObject === 'function') {
      return removeUndefined(obj.toObject());
    }
    return obj;
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;

    if (value !== null && typeof value === 'object') {
      const cleanedValue = removeUndefined(value);
      // Only add if it's not undefined
      if (cleanedValue !== undefined) {
        // For objects, only add if they have keys or are special types
        if (!Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0) {
          continue;
        }
        cleaned[key] = cleanedValue;
      }
    } else {
      cleaned[key] = value;
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : {};
}

/**
 * Utility: Deep merge two objects
 */
export function deepMerge(target, source) {
  // Ensure we have plain objects to work with
  const t = (target && typeof target === 'object' && !Array.isArray(target)) ? target : {};
  const s = (source && typeof source === 'object' && !Array.isArray(source)) ? source : {};

  const result = { ...t };

  for (const key in s) {
    if (s[key] === undefined) continue;

    if (s[key] !== null && typeof s[key] === 'object' && !Array.isArray(s[key])) {
      result[key] = deepMerge(result[key] || {}, s[key]);
    } else {
      result[key] = s[key];
    }
  }

  return result;
}

