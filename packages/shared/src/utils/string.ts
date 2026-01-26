/**
 * Generate URL-friendly slug from text
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens
        .replace(/^-|-$/g, ''); // Trim hyphens
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Extract number from text (handles Romanian/European formats)
 * Examples: "50.000 EUR" -> 50000, "1,234.56" -> 1234.56
 */
export function extractNumber(text: string): number | null {
    if (!text) return null;

    // Remove everything except digits, dots, and commas
    const cleaned = text.replace(/[^\d.,]/g, '');

    if (!cleaned) return null;

    // Handle European format (1.234,56) vs US format (1,234.56)
    const hasEuropeanFormat = /\d\.\d{3}/.test(cleaned) || /,\d{2}$/.test(cleaned);

    let normalized: string;
    if (hasEuropeanFormat) {
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
        normalized = cleaned.replace(/,/g, '');
    }

    const result = parseFloat(normalized);
    return isNaN(result) ? null : result;
}

/**
 * Extract currency from price string
 */
export function extractCurrency(text: string): 'RON' | 'EUR' | null {
    const upper = text.toUpperCase();
    if (upper.includes('EUR') || upper.includes('€')) return 'EUR';
    if (upper.includes('RON') || upper.includes('LEI')) return 'RON';
    return null;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: 'RON' | 'EUR'): string {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
