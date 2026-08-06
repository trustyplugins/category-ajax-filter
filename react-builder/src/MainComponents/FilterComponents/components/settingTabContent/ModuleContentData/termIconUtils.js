export const termHasIcon = (icons) => {
  if (!icons || typeof icons !== "object") return false;
  const iconValue = icons.icon;
  if (typeof iconValue === "string" && iconValue.trim() !== "") {
    return true;
  }
  if (iconValue && typeof iconValue === "object") {
    if (iconValue.url) return true;
    return Object.keys(iconValue).length > 0;
  }
  return false;
};

export const getTermIconPreviewSrc = (icons) => {
  if (!termHasIcon(icons)) return "";
  const iconValue = icons.icon;
  if (typeof iconValue === "string") return iconValue;
  if (iconValue?.url) return iconValue.url;
  if (iconValue?.icon?.url) return iconValue.icon.url;
  return "";
};
