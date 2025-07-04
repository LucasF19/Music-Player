export function lightenColor(hex: string, amount = 0.4) {
    const num = parseInt(hex.replace("#", ""), 16);

    const r = Math.min(255, ((num >> 16) + 255 * amount) | 0);
    const g = Math.min(255, (((num >> 0) & 0x00ff) + 255 * amount) | 0);
    const b = Math.min(255, ((num & 0x0000ff) + 255 * amount) | 0);
    return `rgb(${r}, ${g}, ${b})`;
}

export function isDarkColor(hex: string): boolean {
  if (!hex || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) return false;

  if (hex.length === 4) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128;
}