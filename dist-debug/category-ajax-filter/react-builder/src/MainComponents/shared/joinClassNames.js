/**
 * Join class tokens without empty segments or extra whitespace.
 *
 * @param {...(string|number|boolean|null|undefined)} parts
 * @returns {string}
 */
export function joinClassNames(...parts) {
  const classes = [];

  parts.forEach((part) => {
    if (part == null || part === false || part === true) {
      return;
    }

    String(part)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach((token) => classes.push(token));
  });

  return [...new Set(classes)].join(" ");
}
