/** Default prefix/suffix text when the field is empty after blur. */
export const POST_AFFIX_META_TEXT_DEFAULTS = {
  prefix: "Prefix",
  suffix: "Suffix",
};

export const getPostAffixDefaultMetaText = (placement) =>
  POST_AFFIX_META_TEXT_DEFAULTS[placement] || "Text";

/**
 * Finalize affix text on blur/save: trim edges and fall back to module default.
 * Do not call on onChange — trim removes trailing spaces while typing.
 */
export const normalizePostAffixMetaText = (placement, value) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : getPostAffixDefaultMetaText(placement);
};

/**
 * Input display value: preserve raw text (including trailing spaces) while typing.
 * Only substitutes the module default when enabled, text mode, and stored value is empty.
 */
export const getPostAffixMetaTextForUi = (placement, affixSettings) => {
  const raw = affixSettings?.meta_text ?? "";
  const metaType = affixSettings?.meta_type ?? "text";
  if (affixSettings?.is_enable !== "true" || metaType !== "text") {
    return raw;
  }
  return raw.trim() === "" ? getPostAffixDefaultMetaText(placement) : raw;
};
