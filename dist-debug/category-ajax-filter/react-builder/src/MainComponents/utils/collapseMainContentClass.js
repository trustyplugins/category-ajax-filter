/**
 * Builds class names for design-tab collapse panel content wrappers.
 * Example: collapseMainContentClass("border", "webflow-sync")
 *   → "collapse-main-content caf-builder-custom-border-wrapper webflow-sync"
 */
export function collapseMainContentClass(section, ...extraClasses) {
  const classes = [
    "collapse-main-content",
    `caf-builder-custom-${section}-wrapper`,
  ];

  extraClasses.forEach((extra) => {
    if (!extra) {
      return;
    }
    extra
      .split(/\s+/)
      .filter(Boolean)
      .forEach((cls) => classes.push(cls));
  });

  return classes.join(" ");
}
