import opentype from "opentype.js";

const FONT_WEIGHT_STYLE_PATTERN =
  /(?:^|[\s._-])(regular|normal|bold|italic|oblique|light|medium|semibold|thin|black|extra(?:bold|light)?|condensed|book|roman|mt|ps)(?:$|[\s._-])/i;

export const familyNameFromFilename = (filename = "") => {
  const baseName = String(filename).replace(/\.[^.]+$/, "");
  let cleaned = baseName.replace(FONT_WEIGHT_STYLE_PATTERN, " ");
  cleaned = cleaned.replace(/[-_.]+/g, " ").replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return baseName.replace(/[-_.]+/g, " ").trim();
  }

  return cleaned;
};

export const detectFontFamilyFromFile = async (file) => {
  if (!file) {
    return "";
  }

  const extension = String(file.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension !== "ttf") {
    return "";
  }

  try {
    const buffer = await file.arrayBuffer();
    const font = opentype.parse(buffer);
    const detected =
      font?.getEnglishName?.("preferredFamily") ||
      font?.getEnglishName?.("fontFamily") ||
      font?.names?.preferredFamily?.en ||
      font?.names?.fontFamily?.en ||
      "";

    if (typeof detected === "string" && detected.trim()) {
      return detected.trim();
    }
  } catch (error) {
    // Fall back to filename parsing below.
  }

  return familyNameFromFilename(file.name);
};
