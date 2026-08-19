import {
  buildGoogleFontsStylesheetUrl,
  getVariantsForFamily,
  preloadGoogleFontsCatalog,
} from "./googleFontUrl";
import { getCustomFontCssUrl, loadFontFamily } from "./globalFontFamily";

const collectFontFamilies = (node, fontFamilies) => {
  if (Array.isArray(node)) {
    node.forEach((item) => collectFontFamilies(item, fontFamilies));
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  Object.entries(node).forEach(([key, value]) => {
    if (key === "fontFamily" && typeof value === "string") {
      const normalized = value.trim();
      if (normalized) {
        fontFamilies.add(normalized);
      }
    }

    collectFontFamilies(value, fontFamilies);
  });
};

const getFontLinkId = (fontFamily) =>
  `caf-font-${String(fontFamily).trim().replace(/\s+/g, "-")}`;

export const collectFontFamiliesFromObject = (node) => {
  const fontFamilies = new Set();
  collectFontFamilies(node, fontFamilies);
  return fontFamilies;
};

export const loadFontFamiliesFromObject = (node) => {
  collectFontFamiliesFromObject(node).forEach((fontFamily) => {
    loadFontFamily(fontFamily);
  });
};

export const loadGoogleFontsFromLayout = async (layoutData = []) => {
  const fontFamilies = new Set();
  collectFontFamilies(layoutData, fontFamilies);

  if (!fontFamilies.size) {
    return;
  }

  await preloadGoogleFontsCatalog();

  fontFamilies.forEach((fontFamily) => {
    const linkId = getFontLinkId(fontFamily);
    if (document.getElementById(linkId)) {
      return;
    }

    const customCssUrl = getCustomFontCssUrl(fontFamily);
    const link = document.createElement("link");
    link.async = true;
    link.id = linkId;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = customCssUrl
      ? customCssUrl
      : buildGoogleFontsStylesheetUrl(
          fontFamily,
          getVariantsForFamily(fontFamily)
        );
    document.body.appendChild(link);
  });
};
