/**
 * Build layout utility classes from a Design tab style object (meta1/meta2/meta3).
 * Example: display:flex + flexFlow:row-reverse + justifyContent:flex-start =>
 *   "caf-layout-display-flex caf-layout-direction-row-reverse caf-layout-justify-flex-start"
 */
export function sanitizeLayoutClassToken(value) {
  if (value == null || value === "") return "";
  return String(value).trim().replace(/\s+/g, "-");
}

export function buildLayoutClassesFromStyle(styleObj) {
  if (!styleObj || typeof styleObj !== "object") return "";

  const classes = [];
  const push = (suffix, raw) => {
    const token = sanitizeLayoutClassToken(raw);
    if (token) classes.push(`caf-layout-${suffix}-${token}`);
  };

  if (styleObj.display) push("display", styleObj.display);
  if (styleObj.flexFlow) push("direction", styleObj.flexFlow);
  if (styleObj.justifyContent) push("justify", styleObj.justifyContent);
  if (styleObj.alignItems) push("align", styleObj.alignItems);

  return [...new Set(classes)].join(" ");
}
