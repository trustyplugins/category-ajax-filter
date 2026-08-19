/**
 * Refresh admin/google-fonts.json from Google Fonts public metadata.
 *
 * Output matches the legacy Web Fonts API shape used by PHP + React:
 * { kind: "webfonts#webfontList", items: [{ family, variants, subsets, category }] }
 *
 * Usage (from react-builder):
 *   node scripts/refresh-google-fonts.js
 */

const fs = require("fs");
const path = require("path");

const METADATA_URL = "https://fonts.google.com/metadata/fonts";
const PRO_PLUGIN = path.resolve(__dirname, "../../");
const FREE_PLUGIN = path.resolve(
  __dirname,
  "../../../../../../test-caf-old/wp-content/plugins/category-ajax-filter"
);

const metadataFontKeysToVariants = (fontKeys = []) => {
  const variants = [];

  fontKeys.forEach((key) => {
    const token = String(key || "").trim();
    if (!token) {
      return;
    }
    if (token === "400") {
      variants.push("regular");
      return;
    }
    if (token === "400i") {
      variants.push("italic");
      return;
    }
    if (token.endsWith("i")) {
      variants.push(`${token.slice(0, -1)}italic`);
      return;
    }
    variants.push(token);
  });

  const weight = (variant) => {
    if (variant === "regular" || variant === "italic") {
      return 400;
    }
    const match = variant.match(/^(\d+)/);
    return match ? Number(match[1]) : 9999;
  };

  variants.sort((a, b) => {
    const aItalic = a.includes("italic") && a !== "italic" ? 1 : a === "italic" ? 1 : 0;
    const bItalic = b.includes("italic") && b !== "italic" ? 1 : b === "italic" ? 1 : 0;
    if (aItalic !== bItalic) {
      return aItalic - bItalic;
    }
    return weight(a) - weight(b);
  });

  return variants;
};

const buildCatalog = (familyMetadataList = []) => {
  const items = familyMetadataList
    .filter((entry) => entry?.family && entry?.fonts)
    .map((entry) => ({
      family: entry.family,
      variants: metadataFontKeysToVariants(Object.keys(entry.fonts)),
      subsets: Array.isArray(entry.subsets) ? entry.subsets : [],
      category: entry.category || "sans-serif",
    }))
    .filter((entry) => entry.variants.length > 0)
    .sort((a, b) => a.family.localeCompare(b.family));

  return {
    kind: "webfonts#webfontList",
    items,
  };
};

const writeCatalog = (targetPath, catalog) => {
  const json = `${JSON.stringify(catalog)}\n`;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, json, "utf8");
  const sizeKb = (Buffer.byteLength(json, "utf8") / 1024).toFixed(1);
  console.log(`Wrote ${targetPath} (${catalog.items.length} families, ${sizeKb} KB)`);
};

const main = async () => {
  const response = await fetch(METADATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Fonts metadata (${response.status})`);
  }

  const raw = await response.text();
  const payload = JSON.parse(raw.replace(/^\)\]\}'\n/, ""));
  const catalog = buildCatalog(payload.familyMetadataList || []);

  const proPath = path.join(PRO_PLUGIN, "admin/google-fonts.json");
  writeCatalog(proPath, catalog);

  if (fs.existsSync(FREE_PLUGIN)) {
    writeCatalog(path.join(FREE_PLUGIN, "admin/google-fonts.json"), catalog);
  } else {
    console.warn(`Free plugin path not found, skipped: ${FREE_PLUGIN}`);
  }

  const samples = ["DM Sans", "Inter", "Roboto", "ABeeZee"];
  samples.forEach((family) => {
    const item = catalog.items.find((entry) => entry.family === family);
    if (item) {
      console.log(`${family}: ${item.variants.join(", ")}`);
    }
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
