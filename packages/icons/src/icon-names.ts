export const ICON_NAMES = ["arrowLeft", "book", "scan", "search", "settings"] as const;

export type IconName = (typeof ICON_NAMES)[number];
