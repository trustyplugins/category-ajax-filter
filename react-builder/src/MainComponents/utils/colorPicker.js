import { canUseFeature } from "../../tier/capabilities";

export const COLOR_PICKER_MODES = ["single", "gradient"];

export const canUseGradientColors = () => canUseFeature("gradient_colors");

export const getColorPickerModes = (allowGradient = true) => {
  if (!allowGradient || !canUseGradientColors()) {
    return ["single"];
  }
  return COLOR_PICKER_MODES;
};

const toRgbaString = (metaColor) => {
  if (!metaColor || typeof metaColor !== "object") {
    return "";
  }

  const { r, g, b, a } = metaColor;
  const hasRgb =
    Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b);

  if (!hasRgb) {
    return "";
  }

  if (Number.isFinite(a)) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
};

export const gradientCssToStops = (cssValue) => {
  if (typeof cssValue !== "string" || !cssValue.includes("gradient(")) {
    return null;
  }

  const stopRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})\s+(\d+(?:\.\d+)?)%/g;
  const stops = [];
  let match = stopRegex.exec(cssValue);

  while (match) {
    stops.push({
      color: match[1].trim(),
      percent: Number(match[2]),
    });
    match = stopRegex.exec(cssValue);
  }

  return stops.length > 0 ? stops : null;
};

export const flattenGradientToSolid = (value, fallback = "#000000") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (typeof value !== "string") {
    return value;
  }
  if (!value.includes("gradient(")) {
    return value;
  }
  const stops = gradientCssToStops(value);
  return stops?.[0]?.color || fallback;
};

export const normalizeColorPickerValue = (
  value,
  fallback = "#000000",
  cssValue = ""
) => {
  // AntD ColorPicker provides gradient CSS as the second argument.
  // Prefer it when present so gradient mode remains selected.
  if (typeof cssValue === "string" && cssValue.includes("gradient(")) {
    if (!canUseGradientColors()) {
      return flattenGradientToSolid(cssValue, fallback);
    }
    return cssValue;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  // Support previously stored gradient stop arrays:
  // [{ color: 'rgb(...)', percent: 0 }, ...]
  if (Array.isArray(value)) {
    const gradientStops = value
      .map((item) => {
        const colorText = typeof item?.color === "string" ? item.color : "";
        const percent = Number.isFinite(item?.percent) ? item.percent : 0;
        if (!colorText) {
          return null;
        }
        return `${colorText} ${percent}%`;
      })
      .filter(Boolean);

    if (gradientStops.length > 0) {
      const gradient = `linear-gradient(90deg, ${gradientStops.join(", ")})`;
      return canUseGradientColors()
        ? gradient
        : flattenGradientToSolid(gradient, fallback);
    }
  }

  // AntD gradient mode can return a structured object:
  // { colors: [{ color: { metaColor }, percent }], ... }
  // Convert that into a storable CSS gradient string.
  if (Array.isArray(value?.colors)) {
    const gradientStops = value.colors
      .map((item) => {
        const colorText =
          toRgbaString(item?.color?.metaColor) ||
          (typeof item?.color === "string" ? item.color : "");
        const percent = Number.isFinite(item?.percent) ? item.percent : 0;

        if (!colorText) {
          return null;
        }

        return `${colorText} ${percent}%`;
      })
      .filter(Boolean);

    if (gradientStops.length > 0) {
      const gradient = `linear-gradient(90deg, ${gradientStops.join(", ")})`;
      return canUseGradientColors()
        ? gradient
        : flattenGradientToSolid(gradient, fallback);
    }
  }

  if (typeof value === "string") {
    if (!canUseGradientColors() && value.includes("gradient(")) {
      return flattenGradientToSolid(value, fallback);
    }
    return value;
  }

  if (typeof value?.toCssString === "function") {
    return value.toCssString();
  }

  if (typeof value?.toHexString === "function") {
    return value.toHexString();
  }

  return fallback;
};
