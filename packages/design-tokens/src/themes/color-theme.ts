import { colorTokensByTheme } from "../tokens/colors";
import type { ColorTokens, ResolvedTheme } from "../types";

export function getColorTokens(theme: ResolvedTheme): ColorTokens {
  return colorTokensByTheme[theme];
}
