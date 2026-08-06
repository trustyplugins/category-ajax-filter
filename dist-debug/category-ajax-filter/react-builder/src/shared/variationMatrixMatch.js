/**
 * WooCommerce-style variation matrix matching (supports "Any attribute" wildcards).
 * Keep in sync with CAF_Woo_Post_Helper variation helpers and builder-framework.js CFWooCardVariation.
 */

export function getVariationFixedAttribute(rowAttributes, taxonomy) {
  if (!rowAttributes || typeof rowAttributes !== "object") {
    return "";
  }
  return String(rowAttributes[taxonomy] ?? "").trim();
}

export function getVariationRowSpecificityScore(rowAttributes) {
  if (!rowAttributes || typeof rowAttributes !== "object") {
    return 0;
  }
  return Object.keys(rowAttributes).filter(
    (key) => getVariationFixedAttribute(rowAttributes, key) !== "",
  ).length;
}

/**
 * Whether a matrix row matches user selections (empty row attribute = Woo "Any").
 */
export function variationRowMatchesSelections(
  rowAttributes,
  selections,
  cardAttributes,
) {
  if (!rowAttributes || !selections || !Array.isArray(cardAttributes)) {
    return false;
  }

  for (let i = 0; i < cardAttributes.length; i += 1) {
    const tax = String(cardAttributes[i] || "").trim();
    if (!tax) {
      continue;
    }

    const selected = String(selections[tax] ?? "").trim();
    if (!selected) {
      return false;
    }

    const fixed = getVariationFixedAttribute(rowAttributes, tax);
    if (fixed && fixed !== selected) {
      return false;
    }
  }

  return true;
}

function compareVariationMatchPriority(nextRow, currentBest) {
  if (!currentBest) {
    return true;
  }

  const nextScore = getVariationRowSpecificityScore(nextRow?.attributes);
  const bestScore = getVariationRowSpecificityScore(currentBest?.attributes);
  if (nextScore !== bestScore) {
    return nextScore > bestScore;
  }

  const nextInStock =
    nextRow?.is_in_stock !== false && nextRow?.is_purchasable !== false;
  const bestInStock =
    currentBest?.is_in_stock !== false && currentBest?.is_purchasable !== false;
  if (nextInStock !== bestInStock) {
    return nextInStock;
  }

  return false;
}

export function findBestMatchingVariation(matrix, selections) {
  if (
    !matrix?.variations?.length ||
    !matrix?.attributes?.length ||
    !selections
  ) {
    return null;
  }

  const cardAttributes = matrix.attributes;

  for (let i = 0; i < cardAttributes.length; i += 1) {
    const tax = String(cardAttributes[i] || "").trim();
    if (!tax || !String(selections[tax] ?? "").trim()) {
      return null;
    }
  }

  let best = null;

  for (let v = 0; v < matrix.variations.length; v += 1) {
    const row = matrix.variations[v];
    if (!row?.attributes) {
      continue;
    }
    if (!variationRowMatchesSelections(row.attributes, selections, cardAttributes)) {
      continue;
    }
    if (compareVariationMatchPriority(row, best)) {
      best = row;
    }
  }

  return best;
}

export function isAttributeOptionGloballyAvailable(matrix, taxonomy, slug) {
  if (!matrix?.variations?.length) {
    return true;
  }

  const tax = String(taxonomy || "").trim();
  const value = String(slug || "").trim();
  if (!tax || !value) {
    return false;
  }

  for (let v = 0; v < matrix.variations.length; v += 1) {
    const row = matrix.variations[v];
    if (!row?.attributes) {
      continue;
    }
    const fixed = getVariationFixedAttribute(row.attributes, tax);
    if (!fixed || fixed === value) {
      return true;
    }
  }

  return false;
}

export function isAttributeOptionAvailable(matrix, selections, taxonomy, slug) {
  if (!matrix?.variations?.length || !matrix?.attributes?.length) {
    return true;
  }

  const tax = String(taxonomy || "").trim();
  const value = String(slug || "").trim();
  if (!tax || !value) {
    return false;
  }

  const otherSelections =
    selections && typeof selections === "object" ? selections : {};

  for (let v = 0; v < matrix.variations.length; v += 1) {
    const row = matrix.variations[v];
    if (!row?.attributes) {
      continue;
    }

    const fixedCandidate = getVariationFixedAttribute(row.attributes, tax);
    if (fixedCandidate && fixedCandidate !== value) {
      continue;
    }

    let compatible = true;
    for (let a = 0; a < matrix.attributes.length; a += 1) {
      const otherTax = String(matrix.attributes[a] || "").trim();
      if (!otherTax || otherTax === tax) {
        continue;
      }
      const selected = String(otherSelections[otherTax] ?? "").trim();
      if (!selected) {
        continue;
      }
      const fixed = getVariationFixedAttribute(row.attributes, otherTax);
      if (fixed && fixed !== selected) {
        compatible = false;
        break;
      }
    }

    if (compatible) {
      return true;
    }
  }

  return false;
}
