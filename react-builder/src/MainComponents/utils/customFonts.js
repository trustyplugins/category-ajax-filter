import apiClient from "../../api/client";
import { apiEndpoints } from "../../api/endpoints";
import { syncCustomFontsMap } from "./globalFontFamily";

export const CUSTOM_FONTS_UPDATED_EVENT = "caf-custom-fonts-updated";

export const CUSTOM_FONT_ACCEPT = ".ttf";
export const CUSTOM_FONT_MAX_BYTES = 5 * 1024 * 1024;

export async function fetchCustomFonts() {
  const response = await apiClient.get(apiEndpoints.customFonts);
  return Array.isArray(response?.data?.fonts) ? response.data.fonts : [];
}

export function notifyCustomFontsUpdated(fonts = []) {
  syncCustomFontsMap(fonts);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CUSTOM_FONTS_UPDATED_EVENT, {
        detail: { fonts },
      })
    );
  }
}

export function validateCustomFontFile(file) {
  if (!file) {
    return "Please choose a font file.";
  }

  const extension = String(file.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension !== "ttf") {
    return "Only TTF font files are supported.";
  }

  if (file.size > CUSTOM_FONT_MAX_BYTES) {
    return "Font file must be 5 MB or smaller.";
  }

  return "";
}
