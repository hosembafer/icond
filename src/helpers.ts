type Icon = {
  name: string;
  data: string;
}

/**
 * Creates a namespaced icon name enum from an array of icons.
 *
 * @param icons - Array of icon objects with name and data properties
 * @param namespace - The namespace to prefix each icon name with
 * @returns An object mapping icon names to their namespaced versions
 *
 * @example
 * ```ts
 * const icons = [
 *   { name: 'home', data: '...' },
 *   { name: 'settings', data: '...' }
 * ];
 * const IconNames = createNamespacedIconNameEnum(icons, 'myapp');
 * // Result: { home: 'myapp:home', settings: 'myapp:settings' }
 * ```
 */
export function createNamespacedIconNameEnum<
    const T extends Readonly<Icon[]>,
    const N extends string,
>(
    icons: T,
    namespace: N,
): {
    readonly [K in T[number]['name']]: `${N}:${K}`;
} {
    return Object.fromEntries(
        icons.map((icon) => [icon.name, `${namespace}:${icon.name}`] as const),
    ) as {
        readonly [K in T[number]['name']]: `${N}:${K}`;
    };
}

/**
 * Extracts the viewBox attribute from an SVG string.
 * If no viewBox is found, attempts to construct one from width and height attributes.
 *
 * @param svgData - The SVG string to extract the viewBox from
 * @returns The viewBox string (e.g., "0 0 24 24") or undefined if not found
 *
 * @example
 * ```ts
 * const svg = '<svg viewBox="0 0 24 24">...</svg>';
 * const viewBox = extractViewBox(svg);
 * // Result: "0 0 24 24"
 *
 * const svgWithoutViewBox = '<svg width="24" height="24">...</svg>';
 * const viewBox2 = extractViewBox(svgWithoutViewBox);
 * // Result: "0 0 24 24"
 * ```
 */
export function extractViewBox(svgData: string): string | undefined {
    // Try to extract viewBox first
    const viewBoxMatch = svgData.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch) {
        return viewBoxMatch[1];
    }

    // If no viewBox, extract width and height to create one
    const widthMatch = svgData.match(/width=["'](\d+)["']/);
    const heightMatch = svgData.match(/height=["'](\d+)["']/);

    if (widthMatch && heightMatch) {
        return `0 0 ${widthMatch[1]} ${heightMatch[1]}`;
    }

    return undefined;
}