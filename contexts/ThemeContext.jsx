"use client";

/**
 * Theme Context Provider
 * 
 * This provides theme configuration to all components in the tree.
 * Uses React Context for efficient prop-drilling avoidance.
 * Memoization ensures performance at scale.
 */

import { createContext, useContext, useMemo } from 'react';
import { processRestaurantTheme } from '@/lib/theme-engine';
import { renderBackground } from '@/lib/theme-engine/background-renderer';

/**
 * Theme Context
 */
const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * Wraps the menu application and provides theme to all children
 * 
 * @param {object} props.experienceConfig - Restaurant's experienceConfig from database
 * @param {React.ReactNode} props.children - Child components
 */
export function ThemeProvider({ experienceConfig, children }) {
    // Process theme configuration (memoized for performance)
    const theme = useMemo(() => {
        return processRestaurantTheme(experienceConfig);
    }, [experienceConfig]);

    // Generate inline styles for the root element (CSS variables + background)
    const rootStyles = useMemo(() => {
        const cssVars = theme.cssVars || {};
        const backgroundStyles = renderBackground(theme.config?.background);

        // Merge CSS variables with background styles
        return { ...cssVars, ...backgroundStyles };
    }, [theme]);

    return (
        <ThemeContext.Provider value={theme}>
            <div
                className="theme-root min-h-screen"
                style={rootStyles}
                data-theme-version={theme.metadata?.version}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

/**
 * useTheme Hook
 * Access theme configuration and CSS variables from any component
 * 
 * @returns {object} { config, cssVars, metadata }
 * 
 * @example
 * function MenuItem() {
 *   const theme = useTheme();
 *   return <div style={{ borderRadius: theme.config.menuItem.card.borderRadius }}>...</div>
 * }
 */
export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}

/**
 * useThemeConfig Hook
 * Access just the theme configuration (not CSS vars)
 * Lighter alternative to useTheme when you don't need CSS vars
 * 
 * @returns {object} Theme configuration object
 */
export function useThemeConfig() {
    const theme = useTheme();
    return theme.config;
}

/**
 * useThemeColors Hook
 * Convenient access to just the color system
 * 
 * @returns {object} { brand, backgrounds, text, borders, semantic }
 */
export function useThemeColors() {
    const theme = useTheme();
    return theme.config.colors;
}

/**
 * useThemeTypography Hook
 * Convenient access to just the typography system
 * 
 * @returns {object} { fonts, sizes, lineHeights, letterSpacing }
 */
export function useThemeTypography() {
    const theme = useTheme();
    return theme.config.typography;
}

/**
 * useThemeSpacing Hook
 * Convenient access to just the spacing system
 * 
 * @returns {object} { unit, scale, cardPadding, sectionGap, itemGap }
 */
export function useThemeSpacing() {
    const theme = useTheme();
    return theme.config.spacing;
}

/**
 * withTheme HOC (Higher-Order Component)
 * Injects theme as a prop into any component
 * 
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component with theme prop
 * 
 * @example
 * const ThemedButton = withTheme(({ theme, ...props }) => (
 *   <button style={{ color: theme.config.colors.brand.primary }}>
 *     {props.children}
 *   </button>
 * ));
 */
export function withTheme(Component) {
    return function ThemedComponent(props) {
        const theme = useTheme();
        return <Component {...props} theme={theme} />;
    };
}

/**
 * ThemeConsumer Component
 * Alternative to hooks for class components or render props pattern
 * 
 * @example
 * <ThemeConsumer>
 *   {theme => (
 *     <div style={{ color: theme.config.colors.brand.primary }}>
 *       Themed content
 *     </div>
 *   )}
 * </ThemeConsumer>
 */
export function ThemeConsumer({ children }) {
    return (
        <ThemeContext.Consumer>
            {children}
        </ThemeContext.Consumer>
    );
}

// Export context for advanced use cases
export { ThemeContext };
