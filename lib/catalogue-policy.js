// Compare selected purchase facts, not a whole menu revision or client total.
export const pence = value => Math.round(value * 100);
export const selectionKey = line => [line.menuItemId, line.variantId || "", [...(line.modifierIds || [])].sort().join(",")].join("|");

export function displayedSelection(item, variant, modifierIds = []) {
    return {
        selectionPricePence: pence(variant ? variant.price : item.price),
        modifiers: modifierIds.map(id => ({ id: String(id).toLowerCase(), pricePence: pence(item.modifiers.find(m => String(m._id) === String(id)).price) }))
            .sort((a, b) => a.id.localeCompare(b.id)),
    };
}

export function sameDisplayedSelection(shown, current) {
    if (!shown || shown.selectionPricePence !== current.selectionPricePence) return false;
    const modifiers = [...(shown.modifiers || [])].map(m => ({ id: m.id.toLowerCase(), pricePence: m.pricePence })).sort((a, b) => a.id.localeCompare(b.id));
    return JSON.stringify(modifiers) === JSON.stringify(current.modifiers);
}

export function catalogueMode() {
    return process.env.CATALOGUE_MODE === "automatic" ? "automatic" : "reconfirmation";
}
