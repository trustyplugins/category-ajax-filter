/** Weights exposed in module Design tab font-weight picker. */
import { FONT_WEIGHT_VALUES } from "../constants/fontWeightOptions";

const DEFAULT_BUILDER_WEIGHTS = FONT_WEIGHT_VALUES;

let googleFontsCatalog = null;
let googleFontsCatalogPromise = null;

const getPluginBaseUrl = () => {
  const base = window?.tc_caf_ajax?.plugin_path || "";
  return base.endsWith("/") ? base : `${base}/`;
};

export const variantsToAxisPairs = (variants = []) => {
  const pairMap = new Map();

  const addPair = (ital, weight) => {
    pairMap.set(`${ital},${weight}`, [ital, weight]);
  };

  variants.forEach((variant) => {
    const token = String(variant || "").trim().toLowerCase();
    if (!token) {
      return;
    }
    if (token === "regular") {
      addPair(0, 400);
      return;
    }
    if (token === "italic") {
      addPair(1, 400);
      return;
    }
    const italicMatch = token.match(/^(\d+)italic$/);
    if (italicMatch) {
      addPair(1, Number(italicMatch[1]));
      return;
    }
    if (/^\d+$/.test(token)) {
      addPair(0, Number(token));
    }
  });

  return Array.from(pairMap.values());
};

export const buildGoogleFontsStylesheetUrl = (family, variants = []) => {
  const normalizedFamily = String(family || "").trim();
  if (!normalizedFamily) {
    return "";
  }

  let axisPairs = variantsToAxisPairs(variants);
  if (!axisPairs.length) {
    axisPairs = DEFAULT_BUILDER_WEIGHTS.map((weight) => [0, weight]);
  }

  const familyParam = encodeURIComponent(normalizedFamily).replace(
    /%20/g,
    "+"
  );
  const hasItalic = axisPairs.some(([ital]) => ital === 1);

  if (!hasItalic) {
    const weights = Array.from(
      new Set(axisPairs.map(([, weight]) => weight))
    ).sort((a, b) => a - b);
    return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weights.join(
      ";"
    )}&display=swap`;
  }

  axisPairs.sort((a, b) => {
    if (a[0] !== b[0]) {
      return a[0] - b[0];
    }
    return a[1] - b[1];
  });

  const axisValue = axisPairs.map(([ital, weight]) => `${ital},${weight}`).join(";");
  return `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@${axisValue}&display=swap`;
};

export const setGoogleFontsCatalog = (items = []) => {
  const nextCatalog = {};
  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (item?.family && Array.isArray(item?.variants)) {
        nextCatalog[item.family] = item.variants;
      }
    });
  }
  googleFontsCatalog = nextCatalog;
  return googleFontsCatalog;
};

export const getVariantsForFamily = (family) => {
  const normalized = String(family || "").trim();
  if (!normalized || !googleFontsCatalog) {
    return [];
  }
  return googleFontsCatalog[normalized] || [];
};

export const preloadGoogleFontsCatalog = () => {
  if (googleFontsCatalog) {
    return Promise.resolve(googleFontsCatalog);
  }
  if (googleFontsCatalogPromise) {
    return googleFontsCatalogPromise;
  }

  const fontsUrl = `${getPluginBaseUrl()}admin/google-fonts.json`;
  googleFontsCatalogPromise = fetch(fontsUrl, {
    credentials: "same-origin",
    cache: "no-store",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load google-fonts.json (${response.status})`);
      }
      return response.json();
    })
    .then((payload) => setGoogleFontsCatalog(payload?.items || []))
    .catch((error) => {
      console.error("CAF: unable to load google-fonts.json", error);
      googleFontsCatalog = {};
      return googleFontsCatalog;
    });

  return googleFontsCatalogPromise;
};

export const resolveGoogleFontsStylesheetUrl = async (family) => {
  const normalized = String(family || "").trim();
  if (!normalized) {
    return "";
  }

  await preloadGoogleFontsCatalog();
  const variants = getVariantsForFamily(normalized);
  return buildGoogleFontsStylesheetUrl(normalized, variants);
};
