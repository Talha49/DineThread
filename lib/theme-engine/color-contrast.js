// Design Studio accepts both three- and six-digit hex colours.
export function relativeLuminance(hex) {
    if (!/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(hex)) return null;
    const digits = hex.length === 4 ? hex.slice(1).replace(/./g, c => c + c) : hex.slice(1);
    const [r, g, b] = digits.match(/../g).map(pair => {
        const channel = parseInt(pair, 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function textOnBrand(hex) {
    const luminance = relativeLuminance(hex);
    if (luminance === null) return undefined;
    const blackContrast = (luminance + 0.05) / 0.05;
    const whiteContrast = 1.05 / (luminance + 0.05);
    return blackContrast >= whiteContrast ? '#000000' : '#ffffff';
}
