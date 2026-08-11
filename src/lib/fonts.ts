import type { HandwritingFont } from "../types/domain";

export interface FontOption {
  id: HandwritingFont;
  label: string;
  cssFamily: string;
  meshFontUrl: string;
}

export const FONT_OPTIONS: Record<HandwritingFont, FontOption> = {
  caveat: {
    id: "caveat",
    label: "Caveat",
    cssFamily: "Caveat, cursive",
    meshFontUrl: "/fonts/Caveat-Regular.ttf",
  },
  kalam: {
    id: "kalam",
    label: "Kalam",
    cssFamily: "Kalam, cursive",
    meshFontUrl: "/fonts/Kalam-Regular.ttf",
  },
  "patrick-hand": {
    id: "patrick-hand",
    label: "Patrick Hand",
    cssFamily: '"Patrick Hand", cursive',
    meshFontUrl: "/fonts/PatrickHand-Regular.ttf",
  },
  "shadows-into-light": {
    id: "shadows-into-light",
    label: "Shadows Into Light",
    cssFamily: '"Shadows Into Light", cursive',
    meshFontUrl: "/fonts/ShadowsIntoLight-Regular.ttf",
  },
};

export const FONT_OPTION_LIST = Object.values(FONT_OPTIONS);
