export const COLOR_PICKER_MODES = ["single"];

export const canUseGradientColors = () => false;

export const getColorPickerModes = () => ["single"];

const toRgbaString = (metaColor) => {
  if (!metaColor || typeof metaColor !== "object") return "";

  const { r, g, b, a } = metaColor;
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return "";
  }

  return Number.isFinite(a)
    ? `rgba(${r}, ${g}, ${b}, ${a})`
    : `rgb(${r}, ${g}, ${b})`;
};

export const gradientCssToStops = (cssValue) => {
  if (typeof cssValue !== "string" || !cssValue.includes("gradient(")) {
    return null;
  }

  const stopRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})\s+(\d+(?:\.\d+)?)%/g;
  const stops = [];
  let match = stopRegex.exec(cssValue);
  while (match) {
    stops.push({ color: match[1].trim(), percent: Number(match[2]) });
    match = stopRegex.exec(cssValue);
  }

  return stops.length > 0 ? stops : null;
};

export const flattenGradientToSolid = (value, fallback = "#000000") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value;
  if (!value.includes("gradient(")) return value;

  return gradientCssToStops(value)?.[0]?.color || fallback;
};

export const normalizeColorPickerValue = (
  value,
  fallback = "#000000",
  cssValue = ""
) => {
  if (typeof cssValue === "string" && cssValue.includes("gradient(")) {
    return flattenGradientToSolid(cssValue, fallback);
  }
  if (value === null || value === undefined) return fallback;

  if (Array.isArray(value)) {
    return (
      value.find((item) => typeof item?.color === "string")?.color || fallback
    );
  }

  if (Array.isArray(value?.colors)) {
    const firstColor = value.colors[0]?.color;
    return (
      toRgbaString(firstColor?.metaColor) ||
      (typeof firstColor === "string" ? firstColor : fallback)
    );
  }

  if (typeof value === "string") {
    return flattenGradientToSolid(value, fallback);
  }
  if (typeof value?.toCssString === "function") {
    return flattenGradientToSolid(value.toCssString(), fallback);
  }
  if (typeof value?.toHexString === "function") {
    return value.toHexString();
  }

  return fallback;
};
