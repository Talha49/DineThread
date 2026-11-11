/**
 * Default menu item configuration
 * Used by all presets as a starting point
 */
export const DEFAULT_MENU_ITEM = {
    layout: 'horizontal',
    content: {
        alignment: 'left',
        pricePosition: 'inline'
    },
    image: {
        enabled: true,
        shape: 'rounded',
        borderRadius: 'lg',
        aspectRatio: '1/1',
        objectFit: 'cover'
    },
    card: {
        borderRadius: 'lg',
        shadow: 'md',
        padding: 20,
        border: {
            width: 'none'
        },
        hoverEffect: 'lift'
    }
};
