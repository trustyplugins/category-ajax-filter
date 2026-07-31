import {
  preloadGoogleFontsCatalog,
  resolveGoogleFontsStylesheetUrl,
} from "./googleFontUrl";

export const DEFAULT_GLOBAL_FONT_FAMILY = "DM Sans";

const STYLE_DEVICES = ["desktop", "tablet", "mobile"];
const STYLE_STATES = ["default", "hover"];

export const getGlobalFontFamily = (builderData) => {
  const stored = builderData?.common_data?.global_font_family;
  if (typeof stored === "string" && stored.trim()) {
    return stored.trim();
  }
  return DEFAULT_GLOBAL_FONT_FAMILY;
};

const getCustomFontCssMap = () => {
  const map = window?.tc_caf_ajax?.custom_fonts;
  return map && typeof map === "object" ? map : {};
};

export const getCustomFontCssUrl = (fontFamily) => {
  const normalized = typeof fontFamily === "string" ? fontFamily.trim() : "";
  if (!normalized) {
    return "";
  }
  const map = getCustomFontCssMap();
  return map[normalized] || "";
};

export const isCustomFontFamily = (fontFamily) =>
  Boolean(getCustomFontCssUrl(fontFamily));

const getFontLinkId = (fontFamily) =>
  `caf-font-${String(fontFamily).trim().replace(/\s+/g, "-")}`;

const updateFontSlot = (slot, fontFamily, { replaceOnlyIf, force = false } = {}) => {
  if (!slot || typeof slot !== "object" || !("fontFamily" in slot)) {
    return;
  }
  if (force) {
    slot.fontFamily = fontFamily;
    return;
  }
  if (replaceOnlyIf === undefined || slot.fontFamily === replaceOnlyIf) {
    slot.fontFamily = fontFamily;
  }
};

const walkDeviceStates = (styleBlock, callback) => {
  if (!styleBlock || typeof styleBlock !== "object") {
    return;
  }
  STYLE_DEVICES.forEach((device) => {
    STYLE_STATES.forEach((state) => {
      if (styleBlock[device]?.[state]) {
        callback(styleBlock[device][state]);
      }
    });
  });
};

export const applyGlobalFontToLayoutElement = (
  element,
  fontFamily,
  options = {}
) => {
  if (!element?.style || typeof element.style !== "object") {
    return;
  }

  const style = element.style;
  walkDeviceStates(style, (slot) => updateFontSlot(slot, fontFamily, options));

  Object.keys(style).forEach((key) => {
    if (STYLE_DEVICES.includes(key)) {
      return;
    }
    const section = style[key];
    if (section && typeof section === "object") {
      walkDeviceStates(section, (slot) => updateFontSlot(slot, fontFamily, options));
    }
  });
};

const walkLayoutRows = (rows, fontFamily, options) => {
  if (!Array.isArray(rows)) {
    return;
  }
  rows.forEach((row) => {
    applyGlobalFontToLayoutElement(row, fontFamily, options);
    row.data?.forEach((column) => {
      applyGlobalFontToLayoutElement(column, fontFamily, options);
      column.data?.forEach((module) => {
        applyGlobalFontToLayoutElement(module, fontFamily, options);
      });
    });
  });
};

export const propagateGlobalFontInBuilder = (
  builderData,
  newFont,
  oldFont = DEFAULT_GLOBAL_FONT_FAMILY
) => {
  if (!builderData || typeof builderData !== "object") {
    return;
  }

  const options = { replaceOnlyIf: oldFont };
  walkLayoutRows(builderData?.filter_layout_data?.initial_data, newFont, options);
  walkLayoutRows(builderData?.post_layout_data?.initial_data, newFont, options);

  const miscPreview =
    builderData?.common_data?.preview_template_data?.misc_preview_data;
  if (miscPreview && typeof miscPreview === "object") {
    Object.values(miscPreview).forEach((item) => {
      if (item && typeof item === "object") {
        applyGlobalFontToLayoutElement(item, newFont, options);
      }
    });
  }
};

export const syncCustomFontsMap = (fonts = []) => {
  if (!window.tc_caf_ajax || typeof window.tc_caf_ajax !== "object") {
    window.tc_caf_ajax = {};
  }
  const nextMap = { ...(window.tc_caf_ajax.custom_fonts || {}) };
  fonts.forEach((font) => {
    if (font?.family && font?.css_url) {
      nextMap[font.family] = font.css_url;
    }
  });
  window.tc_caf_ajax.custom_fonts = nextMap;
};

export const removeCustomFontFromMap = (family) => {
  if (!window.tc_caf_ajax?.custom_fonts || !family) {
    return;
  }
  const nextMap = { ...window.tc_caf_ajax.custom_fonts };
  delete nextMap[family];
  window.tc_caf_ajax.custom_fonts = nextMap;
};

export const loadFontFamily = (fontFamily) => {
  if (!fontFamily || typeof fontFamily !== "string") {
    return;
  }
  const normalized = fontFamily.trim();
  if (!normalized) {
    return;
  }

  const linkId = getFontLinkId(normalized);
  if (document.getElementById(linkId)) {
    return;
  }

  const customCssUrl = getCustomFontCssUrl(normalized);
  if (customCssUrl) {
    const link = document.createElement("link");
    link.href = customCssUrl;
    link.async = true;
    link.id = linkId;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.body.appendChild(link);
    return;
  }

  resolveGoogleFontsStylesheetUrl(normalized)
    .then((stylesheetUrl) => {
      if (!stylesheetUrl || document.getElementById(linkId)) {
        return;
      }
      const link = document.createElement("link");
      link.href = stylesheetUrl;
      link.async = true;
      link.id = linkId;
      link.type = "text/css";
      link.rel = "stylesheet";
      document.body.appendChild(link);
    })
    .catch((error) => {
      console.error("CAF: unable to load font family", normalized, error);
    });
};

export const loadGoogleFontFamily = loadFontFamily;

export { preloadGoogleFontsCatalog };
